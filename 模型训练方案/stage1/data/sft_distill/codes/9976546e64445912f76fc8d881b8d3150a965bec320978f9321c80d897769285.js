class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.totalLevels = 5;
    this.baseEnemies = 12;
    this.enemiesPerLevel = 2;
    this.remainingEnemies = 0;
    this.gameOver = false;
    this.gameWon = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(0, -20);
    playerGraphics.lineTo(-15, 20);
    playerGraphics.lineTo(15, 20);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 30, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小矩形）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 4, 10);
    bulletGraphics.generateTexture('bullet', 4, 10);
    bulletGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200; // 毫秒

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 46, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel();
  }

  startLevel() {
    if (this.currentLevel > this.totalLevels) {
      this.gameWon = true;
      this.statusText.setText('YOU WIN!\nAll 5 Levels Completed!');
      this.statusText.setVisible(true);
      return;
    }

    // 计算当前关卡敌人数量：12, 14, 16, 18, 20
    const enemyCount = this.baseEnemies + (this.currentLevel - 1) * this.enemiesPerLevel;
    this.remainingEnemies = enemyCount;

    // 清除旧敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定模式以保证确定性）
    const rows = Math.ceil(enemyCount / 6);
    const cols = Math.min(6, enemyCount);
    let enemyIndex = 0;

    for (let row = 0; row < rows && enemyIndex < enemyCount; row++) {
      for (let col = 0; col < cols && enemyIndex < enemyCount; col++) {
        const x = 100 + col * 100;
        const y = 80 + row * 60;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(50 + this.currentLevel * 10, 0);
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemyIndex++;
      }
    }

    this.updateUI();
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否完成当前关卡
    if (this.remainingEnemies <= 0) {
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel();
      });
    }
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.totalLevels}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}`);
    
    if (this.currentLevel > this.totalLevels && !this.gameWon) {
      this.statusText.setVisible(false);
    }
  }

  update(time, delta) {
    if (this.gameOver || this.gameWon) {
      return;
    }

    // 玩家移动
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(300);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(300);
    } else {
      this.player.setVelocityY(0);
    }

    // 射击
    if (this.spaceKey.isDown && time > this.lastFired + this.fireRate) {
      this.shootBullet();
      this.lastFired = time;
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.destroy();
      }
    });

    // 检查敌人是否到达底部（游戏失败条件）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 580) {
        this.gameOver = true;
        this.statusText.setText('GAME OVER\nEnemies Reached Bottom!');
        this.statusText.setFill('#ff0000');
        this.statusText.setVisible(true);
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);