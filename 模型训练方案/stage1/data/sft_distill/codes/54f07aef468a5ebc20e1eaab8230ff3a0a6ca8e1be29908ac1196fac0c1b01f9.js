class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.collisionCount = 0;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      health: this.health,
      collisionCount: this.collisionCount,
      cameraShaking: false,
      gameState: 'running'
    };

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
      enemy.setBounce(1);
      enemy.setCollideWorldBounds(true);
    }

    // 设置镜头跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    this.cameras.main.setBounds(0, 0, 800, 600);

    // 添加碰撞检测
    this.physics.add.collider(
      this.player,
      this.enemies,
      this.handleCollision,
      null,
      this
    );

    // 创建生命值显示文本（固定在镜头上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上

    // 创建碰撞计数显示
    this.collisionText = this.add.text(16, 50, `Collisions: ${this.collisionCount}`, {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);

    // 创建提示文本
    this.infoText = this.add.text(16, 84, 'Use Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.infoText.setScrollFactor(0);

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞冷却时间
    this.canCollide = true;
    this.collisionCooldown = 1000; // 1秒冷却

    console.log('[GAME] Game initialized', JSON.stringify(window.__signals__));
  }

  handleCollision(player, enemy) {
    // 冷却时间内不触发
    if (!this.canCollide) return;

    this.canCollide = false;
    this.collisionCount++;

    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) this.health = 0;

    // 更新显示
    this.healthText.setText(`Health: ${this.health}`);
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 触发镜头震动 4秒
    this.cameras.main.shake(4000, 0.01);

    // 更新信号
    window.__signals__.health = this.health;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.cameraShaking = true;

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // 敌人被击退
    const angle = Phaser.Math.Angle.Between(
      enemy.x, enemy.y,
      player.x, player.y
    );
    enemy.setVelocity(
      -Math.cos(angle) * 200,
      -Math.sin(angle) * 200
    );

    console.log('[COLLISION]', JSON.stringify({
      health: this.health,
      collisionCount: this.collisionCount,
      timestamp: Date.now()
    }));

    // 检查游戏结束
    if (this.health <= 0) {
      window.__signals__.gameState = 'gameOver';
      this.gameOver();
    }

    // 重置冷却
    this.time.delayedCall(this.collisionCooldown, () => {
      this.canCollide = true;
    });

    // 4秒后重置震动状态
    this.time.delayedCall(4000, () => {
      window.__signals__.cameraShaking = false;
      console.log('[CAMERA] Shake ended');
    });
  }

  gameOver() {
    this.physics.pause();
    
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);

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

    console.log('[GAME OVER]', JSON.stringify(window.__signals__));
  }

  update(time, delta) {
    if (this.health <= 0) return;

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

    // 更新信号（每帧更新玩家位置）
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
  }
}

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

new Phaser.Game(config);