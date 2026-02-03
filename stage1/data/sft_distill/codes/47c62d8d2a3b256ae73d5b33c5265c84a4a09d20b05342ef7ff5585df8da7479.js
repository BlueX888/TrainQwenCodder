class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesRemaining = 0;
    this.gameState = 'playing'; // playing, levelComplete, gameComplete
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0066ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（灰色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x808080, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

    // 初始化关卡
    this.initLevel();

    // 创建UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '20px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.statusText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);

    // 射击冷却
    this.lastShootTime = 0;
    this.shootCooldown = 300;

    // 更新UI
    this.updateUI();
  }

  initLevel() {
    // 计算当前关卡的敌人数量
    const enemyCount = 12 + (this.currentLevel - 1) * 2;
    this.enemiesRemaining = enemyCount;
    this.gameState = 'playing';

    // 清理旧对象
    if (this.player) this.player.destroy();
    if (this.enemies) this.enemies.clear(true, true);
    if (this.bullets) this.bullets.clear(true, true);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 500, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(28, 28);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 20
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 生成敌人（网格布局）
    const cols = Math.ceil(Math.sqrt(enemyCount));
    const rows = Math.ceil(enemyCount / cols);
    const startX = 100;
    const startY = 80;
    const spacingX = 100;
    const spacingY = 80;

    let enemyIndex = 0;
    for (let row = 0; row < rows && enemyIndex < enemyCount; row++) {
      for (let col = 0; col < cols && enemyIndex < enemyCount; col++) {
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(-50, 50)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        enemy.body.setCircle(14);
        enemyIndex++;
      }
    }

    // 碰撞检测
    this.physics.add.overlap(
      this.bullets,
      this.enemies,
      this.bulletHitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.playerHitEnemy,
      null,
      this
    );
  }

  bulletHitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.enemiesRemaining--;
    this.updateUI();

    // 检查是否完成关卡
    if (this.enemiesRemaining <= 0) {
      this.levelComplete();
    }
  }

  playerHitEnemy(player, enemy) {
    // 游戏结束，重新开始当前关卡
    this.gameState = 'gameOver';
    this.statusText.setText('GAME OVER!\nPress ENTER to Restart Level').setVisible(true);
    this.physics.pause();
  }

  levelComplete() {
    this.gameState = 'levelComplete';
    this.physics.pause();

    if (this.currentLevel >= this.maxLevel) {
      this.statusText.setText('ALL LEVELS COMPLETE!\nPress ENTER to Restart').setVisible(true);
      this.gameState = 'gameComplete';
    } else {
      this.statusText.setText(`LEVEL ${this.currentLevel} COMPLETE!\nPress ENTER for Next Level`).setVisible(true);
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemiesRemaining}`);
  }

  shoot() {
    const currentTime = this.time.now;
    if (currentTime - this.lastShootTime < this.shootCooldown) {
      return;
    }

    const bullet = this.bullets.get(this.player.x, this.player.y - 20);
    if (bullet) {
      bullet.setActive(true);
      bullet.setVisible(true);
      bullet.setVelocityY(-400);
      bullet.body.setSize(6, 6);
      this.lastShootTime = currentTime;
    }
  }

  update(time, delta) {
    if (this.gameState === 'playing') {
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
      if (this.spaceKey.isDown) {
        this.shoot();
      }

      // 清理超出屏幕的子弹
      this.bullets.children.entries.forEach(bullet => {
        if (bullet.y < -10) {
          bullet.destroy();
        }
      });
    } else if (this.gameState === 'levelComplete' || this.gameState === 'gameOver' || this.gameState === 'gameComplete') {
      // 按回车键继续
      if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
        this.statusText.setVisible(false);
        
        if (this.gameState === 'gameOver') {
          // 重新开始当前关卡
          this.physics.resume();
          this.initLevel();
          this.updateUI();
        } else if (this.gameState === 'levelComplete') {
          // 进入下一关
          this.currentLevel++;
          this.physics.resume();
          this.initLevel();
          this.updateUI();
        } else if (this.gameState === 'gameComplete') {
          // 重新开始游戏
          this.currentLevel = 1;
          this.physics.resume();
          this.initLevel();
          this.updateUI();
        }
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
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