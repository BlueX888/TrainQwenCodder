class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.remainingEnemies = 0;
  }

  preload() {
    // 使用Graphics生成纹理
    this.createTextures();
  }

  createTextures() {
    // 玩家纹理（蓝色三角形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.beginPath();
    playerGraphics.moveTo(16, 0);
    playerGraphics.lineTo(0, 32);
    playerGraphics.lineTo(32, 32);
    playerGraphics.closePath();
    playerGraphics.fillPath();
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 550, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建子弹组
    this.bullets = this.physics.add.group({
      defaultKey: 'bullet',
      maxSize: 30
    });

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.lastFired = 0;
    this.fireRate = 200; // 射击间隔（毫秒）

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    this.enemyCountText = this.add.text(16, 48, '', {
      fontSize: '20px',
      fill: '#ffffff'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#ffff00',
      align: 'center'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(this.currentLevel);
  }

  startLevel(level) {
    this.currentLevel = level;
    this.enemiesPerLevel = 12 + (level - 1) * 2;
    this.remainingEnemies = this.enemiesPerLevel;

    // 清空现有敌人和子弹
    this.enemies.clear(true, true);
    this.bullets.clear(true, true);

    // 生成敌人
    this.spawnEnemies();

    // 更新UI
    this.updateUI();

    // 显示关卡开始信息
    this.messageText.setText(`Level ${level}\nEnemies: ${this.enemiesPerLevel}`);
    this.time.delayedCall(2000, () => {
      this.messageText.setText('');
    });
  }

  spawnEnemies() {
    const cols = Math.ceil(Math.sqrt(this.enemiesPerLevel));
    const rows = Math.ceil(this.enemiesPerLevel / cols);
    const spacingX = 60;
    const spacingY = 50;
    const startX = 400 - (cols * spacingX) / 2;
    const startY = 80;

    let count = 0;
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        if (count >= this.enemiesPerLevel) break;
        
        const x = startX + col * spacingX;
        const y = startY + row * spacingY;
        const enemy = this.enemies.create(x, y, 'enemy');
        enemy.setVelocity(
          Phaser.Math.Between(-50, 50),
          Phaser.Math.Between(20, 40)
        );
        enemy.setBounce(1);
        enemy.setCollideWorldBounds(true);
        
        count++;
      }
    }
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    this.remainingEnemies--;
    this.updateUI();

    // 检查是否通关
    if (this.remainingEnemies === 0) {
      this.levelComplete();
    }
  }

  levelComplete() {
    if (this.currentLevel < this.maxLevel) {
      this.messageText.setText(`Level ${this.currentLevel} Complete!\nNext Level in 3s`);
      this.time.delayedCall(3000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    } else {
      this.messageText.setText(`All Levels Complete!\nYou Win!`);
      this.physics.pause();
    }
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.remainingEnemies}/${this.enemiesPerLevel}`);
  }

  shoot() {
    const time = this.time.now;
    if (time > this.lastFired + this.fireRate) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);
        this.lastFired = time;
      }
    }
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

    // 射击
    if (this.spaceKey.isDown) {
      this.shoot();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < -10) {
        bullet.destroy();
      }
    });

    // 敌人简单AI（向下移动）
    this.enemies.children.entries.forEach(enemy => {
      if (enemy.active && enemy.y > 580) {
        enemy.y = 10;
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