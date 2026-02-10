class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.isShaking = false;
  }

  preload() {
    // 使用 Graphics 生成纹理，无需外部资源
  }

  create() {
    // 生成玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建更大的世界边界以便相机追踪
    this.physics.world.setBounds(0, 0, 1600, 1200);

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setSize(32, 32);

    // 创建多个敌人
    this.enemies = this.physics.add.group();
    for (let i = 0; i < 5; i++) {
      const x = Phaser.Math.Between(100, 1500);
      const y = Phaser.Math.Between(100, 1100);
      const enemy = this.enemies.create(x, y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.body.setSize(32, 32);
      
      // 给敌人随机速度
      enemy.setVelocity(
        Phaser.Math.Between(-100, 100),
        Phaser.Math.Between(-100, 100)
      );
      enemy.setBounce(1, 1);
    }

    // 设置碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 相机追踪玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 1600, 1200);

    // 创建生命值显示（固定在屏幕左上角）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在相机视野中

    // 创建提示文本
    this.infoText = this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.infoText.setScrollFactor(0);

    // 状态文本（用于验证）
    this.statusText = this.add.text(16, 80, 'Status: Normal', {
      fontSize: '16px',
      fill: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.statusText.setScrollFactor(0);

    // 碰撞计数器（用于验证）
    this.collisionCount = 0;
    this.collisionText = this.add.text(16, 110, `Collisions: ${this.collisionCount}`, {
      fontSize: '16px',
      fill: '#ff9900',
      backgroundColor: '#000000',
      padding: { x: 8, y: 4 }
    });
    this.collisionText.setScrollFactor(0);
  }

  handleCollision(player, enemy) {
    // 防止重复触发（震动期间不再扣血）
    if (this.isShaking) {
      return;
    }

    // 标记震动状态
    this.isShaking = true;

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) {
      this.health = 0;
    }

    // 更新生命值显示
    this.healthText.setText(`Health: ${this.health}`);
    
    // 更新碰撞计数
    this.collisionCount++;
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 触发相机震动 1 秒
    // shake(duration, intensity)
    this.cameras.main.shake(1000, 0.01);

    // 更新状态文本
    this.statusText.setText('Status: SHAKING!');
    this.statusText.setStyle({ fill: '#ff0000' });

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 9
    });

    // 1 秒后解除震动状态
    this.time.delayedCall(1000, () => {
      this.isShaking = false;
      this.statusText.setText('Status: Normal');
      this.statusText.setStyle({ fill: '#00ff00' });
    });

    // 检查游戏结束
    if (this.health <= 0) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(
      this.cameras.main.centerX,
      this.cameras.main.centerY,
      'GAME OVER\nClick to Restart',
      {
        fontSize: '48px',
        fill: '#ff0000',
        backgroundColor: '#000000',
        padding: { x: 20, y: 10 },
        align: 'center'
      }
    );
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

    this.input.once('pointerdown', () => {
      this.scene.restart();
    });
  }

  update(time, delta) {
    if (this.health <= 0) {
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

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
const game = new Phaser.Game(config);