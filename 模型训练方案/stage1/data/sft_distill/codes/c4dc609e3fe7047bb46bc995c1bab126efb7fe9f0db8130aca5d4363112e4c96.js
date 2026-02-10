class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.currentLevel = 1;
    this.maxLevel = 5;
    this.enemiesPerLevel = 0;
    this.player = null;
    this.enemies = null;
    this.bullets = null;
    this.cursors = null;
    this.fireKey = null;
    this.lastFired = 0;
    this.fireRate = 200;
    this.levelText = null;
    this.enemyCountText = null;
    this.messageText = null;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（橙色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff8800, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建子弹纹理（黄色小圆）
    const bulletGraphics = this.add.graphics();
    bulletGraphics.fillStyle(0xffff00, 1);
    bulletGraphics.fillCircle(4, 4, 4);
    bulletGraphics.generateTexture('bullet', 8, 8);
    bulletGraphics.destroy();

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

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.wasd = {
      up: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      down: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      left: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    };

    // 碰撞检测
    this.physics.add.overlap(this.bullets, this.enemies, this.hitEnemy, null, this);

    // UI 文本
    this.levelText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.enemyCountText = this.add.text(16, 50, '', {
      fontSize: '20px',
      fill: '#ffffff',
      fontFamily: 'Arial'
    });

    this.messageText = this.add.text(400, 300, '', {
      fontSize: '32px',
      fill: '#00ff00',
      fontFamily: 'Arial'
    }).setOrigin(0.5);

    // 开始第一关
    this.startLevel(1);
  }

  startLevel(level) {
    this.currentLevel = level;
    
    if (this.currentLevel > this.maxLevel) {
      this.showVictory();
      return;
    }

    // 计算敌人数量：第1关5个，每关增加2个
    this.enemiesPerLevel = 5 + 2 * (this.currentLevel - 1);

    // 清空现有敌人
    this.enemies.clear(true, true);

    // 生成敌人（使用固定种子确保确定性）
    const seed = this.currentLevel * 1000;
    for (let i = 0; i < this.enemiesPerLevel; i++) {
      // 使用伪随机但确定的位置
      const x = 100 + ((seed + i * 137) % 600);
      const y = 50 + ((seed + i * 211) % 200);
      
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        ((seed + i * 73) % 100) - 50,
        ((seed + i * 97) % 100) - 50
      );
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 更新 UI
    this.updateUI();
    this.messageText.setText('');
  }

  updateUI() {
    this.levelText.setText(`Level: ${this.currentLevel}/${this.maxLevel}`);
    this.enemyCountText.setText(`Enemies: ${this.enemies.countActive(true)}/${this.enemiesPerLevel}`);
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    enemy.destroy();
    
    this.updateUI();

    // 检查是否消灭所有敌人
    if (this.enemies.countActive(true) === 0) {
      this.messageText.setText('Level Complete!');
      this.time.delayedCall(2000, () => {
        this.startLevel(this.currentLevel + 1);
      });
    }
  }

  showVictory() {
    this.messageText.setText('YOU WIN!\nAll 5 Levels Complete!');
    this.messageText.setFill('#ffff00');
    this.player.setVelocity(0, 0);
    this.enemies.setVelocityX(0);
    this.enemies.setVelocityY(0);
  }

  fireBullet() {
    if (this.time.now > this.lastFired + this.fireRate) {
      const bullet = this.bullets.get(this.player.x, this.player.y - 20);
      
      if (bullet) {
        bullet.setActive(true);
        bullet.setVisible(true);
        bullet.setVelocityY(-400);
        this.lastFired = this.time.now;
      }
    }
  }

  update(time, delta) {
    // 玩家移动
    const speed = 300;
    this.player.setVelocity(0);

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 射击
    if (this.fireKey.isDown) {
      this.fireBullet();
    }

    // 清理超出边界的子弹
    this.bullets.children.entries.forEach(bullet => {
      if (bullet.active && bullet.y < 0) {
        bullet.setActive(false);
        bullet.setVisible(false);
      }
    });
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