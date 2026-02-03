class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerHealth = 100;
    this.collisionCooldown = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 32, 32);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 700);
      const y = Phaser.Math.Between(100, 500);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(1);
    }

    // 添加碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 设置相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setZoom(1);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // 创建生命值显示文本（固定在相机上）
    this.healthText = this.add.text(16, 16, `Health: ${this.playerHealth}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在相机上

    // 创建提示文本
    this.infoText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 5, y: 3 }
    });
    this.infoText.setScrollFactor(0);

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加背景网格以便观察相机移动
    this.createBackground();
  }

  createBackground() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
    
    graphics.setDepth(-1);
  }

  handleCollision(player, enemy) {
    // 使用冷却时间防止连续碰撞造成多次扣血
    if (this.collisionCooldown) {
      return;
    }

    this.collisionCooldown = true;

    // 扣减生命值
    this.playerHealth -= 10;
    if (this.playerHealth < 0) {
      this.playerHealth = 0;
    }

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.playerHealth}`);

    // 触发相机震动效果，持续1000毫秒
    this.cameras.main.shake(1000, 0.01);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // 检查游戏结束
    if (this.playerHealth <= 0) {
      this.gameOver();
    }

    // 设置冷却时间
    this.time.delayedCall(1000, () => {
      this.collisionCooldown = false;
    });
  }

  gameOver() {
    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    // 停止玩家移动
    this.player.setVelocity(0, 0);
    this.physics.pause();

    // 重启提示
    this.time.delayedCall(2000, () => {
      const restartText = this.add.text(400, 360, 'Click to Restart', {
        fontSize: '24px',
        fill: '#ffffff',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      restartText.setOrigin(0.5);
      restartText.setScrollFactor(0);

      this.input.once('pointerdown', () => {
        this.scene.restart();
      });
    });
  }

  update(time, delta) {
    if (this.playerHealth <= 0) {
      return;
    }

    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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