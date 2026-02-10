class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.health = 100;
    this.collisionCount = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化信号系统
    window.__signals__ = {
      health: this.health,
      collisionCount: this.collisionCount,
      cameraShaking: false,
      events: []
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

    // 创建背景网格以便观察镜头震动效果
    this.createGrid();

    // 创建玩家（可移动）
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
    this.cameras.main.setZoom(1);

    // 设置碰撞检测
    this.physics.add.collider(this.player, this.enemies, this.handleCollision, null, this);

    // 创建生命值UI（固定在屏幕上）
    this.healthText = this.add.text(16, 16, `Health: ${this.health}`, {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.healthText.setScrollFactor(0); // 固定在镜头上
    this.healthText.setDepth(100);

    // 碰撞计数UI
    this.collisionText = this.add.text(16, 50, `Collisions: ${this.collisionCount}`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.collisionText.setScrollFactor(0);
    this.collisionText.setDepth(100);

    // 提示文本
    this.instructionText = this.add.text(400, 16, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      color: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 0);
    this.instructionText.setScrollFactor(0);
    this.instructionText.setDepth(100);

    // 键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    console.log('[Game] Scene created, health:', this.health);
  }

  createGrid() {
    // 创建背景网格以便观察镜头震动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x444444, 0.5);
    
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }
  }

  handleCollision(player, enemy) {
    // 扣减生命值
    this.health -= 10;
    if (this.health < 0) this.health = 0;

    // 增加碰撞计数
    this.collisionCount++;

    // 更新UI
    this.healthText.setText(`Health: ${this.health}`);
    this.collisionText.setText(`Collisions: ${this.collisionCount}`);

    // 触发镜头震动（2秒 = 2000毫秒）
    this.cameras.main.shake(2000, 0.01);

    // 玩家闪烁效果
    this.tweens.add({
      targets: player,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 5
    });

    // 更新信号
    window.__signals__.health = this.health;
    window.__signals__.collisionCount = this.collisionCount;
    window.__signals__.cameraShaking = true;
    window.__signals__.events.push({
      type: 'collision',
      timestamp: Date.now(),
      health: this.health,
      collisionCount: this.collisionCount
    });

    // 2秒后重置震动状态
    this.time.delayedCall(2000, () => {
      window.__signals__.cameraShaking = false;
    });

    // 控制台输出
    console.log(JSON.stringify({
      event: 'collision',
      health: this.health,
      collisionCount: this.collisionCount,
      cameraShake: true,
      duration: 2000
    }));

    // 游戏结束检测
    if (this.health <= 0) {
      this.handleGameOver();
    }
  }

  handleGameOver() {
    // 停止物理
    this.physics.pause();

    // 显示游戏结束文本
    const gameOverText = this.add.text(400, 300, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    });
    gameOverText.setOrigin(0.5);
    gameOverText.setScrollFactor(0);
    gameOverText.setDepth(200);

    window.__signals__.events.push({
      type: 'gameOver',
      timestamp: Date.now(),
      finalHealth: this.health,
      totalCollisions: this.collisionCount
    });

    console.log(JSON.stringify({
      event: 'gameOver',
      finalHealth: this.health,
      totalCollisions: this.collisionCount
    }));
  }

  update(time, delta) {
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

const game = new Phaser.Game(config);