class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 5; // 第1关基础敌人数
    this.enemyIncrement = 2; // 每关增加数量
    this.score = 0;
    this.totalEnemies = 0;
    this.remainingEnemies = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建纹理
    this.createTextures();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 输入控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.canShoot = true;

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.instructionText = this.add.text(400, 580, '方向键移动 | 空格射击', {
      fontSize: '16px',
      fill: '#ffff00'
    }).setOrigin(0.5);

    this.victoryText = this.add.text(400, 300, '', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5).setVisible(false);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  createTextures() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小方块）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillRect(0, 0, 8, 8);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  startLevel(level) {
    // 清除旧敌人
    this.enemies.clear(true, true);

    // 计算当前关卡敌人数量
    this.totalEnemies = this.enemiesPerLevel + (level - 1) * this.enemyIncrement;
    this.remainingEnemies = this.totalEnemies;

    // 生成敌人（使用固定种子保证确定性）
    const seed = level * 1000;
    const rows = Math.ceil(Math.sqrt(this.totalEnemies));
    const cols = Math.ceil(this.totalEnemies / rows);
    const startX = 100;
    const startY = 80;
    const spacingX = 120;
    const spacingY = 80;

    let enemyCount = 0;
    for (let row = 0; row < rows && enemyCount < this.totalEnemies; row++) {
      for (let col = 0; col < cols && enemyCount < this.totalEnemies; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          this.seededRandom(seed + enemyCount) * 100 - 50,
          this.seededRandom(seed + enemyCount + 100) * 50 + 20
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemyCount++;
      }
    }

    // 更新UI
    this.updateUI();
  }

  seededRandom(seed) {
    // 简单的伪随机数生成器（确定性）
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  update(time, delta) {
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
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && this.canShoot) {
      this.shootBullet();
    }

    // 清理超出屏幕的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });

    // 检查是否通关
    if (this.remainingEnemies === 0 && this.currentLevel <= this.maxLevel) {
      this.checkLevelComplete();
    }
  }

  shootBullet() {
    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      this.canShoot = false;
      this.time.delayedCall(200, () => {
        this.canShoot = true;
      });
    }
  }

  hitEnemy(bullet, enemy) {
    // 销毁子弹和敌人
    bullet.setActive(false);
    bullet.setVisible(false);
    enemy.destroy();

    // 更新计数
    this.remainingEnemies--;
    this.score += 10;
    this.updateUI();
  }

  updateUI() {
    this.levelText.setText(`关卡: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyText.setText(`剩余敌人: ${this.remainingEnemies}/${this.totalEnemies}`);
  }

  checkLevelComplete() {
    if (this.currentLevel < this.maxLevel) {
      // 进入下一关
      this.currentLevel++;
      this.time.delayedCall(1000, () => {
        this.startLevel(this.currentLevel);
      });
    } else {
      // 游戏胜利
      this.showVictory();
    }
  }

  showVictory() {
    this.victoryText.setText(`胜利！\n总分: ${this.score}`);
    this.victoryText.setVisible(true);
    this.physics.pause();
    this.instructionText.setText('刷新页面重新开始');
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