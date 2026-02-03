class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0;
    this.gameOver = false;
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 初始化状态
    this.survivalTime = 0;
    this.gameOver = false;

    // 创建玩家纹理（蓝色圆形）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00aaff, 1);
    playerGraphics.fillCircle(20, 20, 20);
    playerGraphics.generateTexture('player', 40, 40);
    playerGraphics.destroy();

    // 创建敌人纹理（红色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillCircle(15, 15, 15);
    enemyGraphics.generateTexture('enemy', 30, 30);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setMaxVelocity(300);
    this.player.setDrag(800);

    // 创建敌人组
    this.enemies = this.physics.add.group();

    // 在场景边缘随机生成 10 个敌人
    const positions = [
      { x: 50, y: 50 },
      { x: 750, y: 50 },
      { x: 50, y: 550 },
      { x: 750, y: 550 },
      { x: 400, y: 50 },
      { x: 400, y: 550 },
      { x: 50, y: 300 },
      { x: 750, y: 300 },
      { x: 200, y: 50 },
      { x: 600, y: 550 }
    ];

    positions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0.5);
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 游戏说明
    this.add.text(400, 580, 'Use Arrow Keys to Move - Avoid Red Enemies!', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '64px',
      fill: '#ff0000',
      backgroundColor: '#000000',
      padding: { x: 20, y: 10 }
    }).setOrigin(0.5).setVisible(false);

    // 记录开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.gameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText(`Time: ${this.survivalTime}s`);

    // 玩家移动控制
    const acceleration = 600;

    if (this.cursors.left.isDown) {
      this.player.setAccelerationX(-acceleration);
    } else if (this.cursors.right.isDown) {
      this.player.setAccelerationX(acceleration);
    } else {
      this.player.setAccelerationX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setAccelerationY(-acceleration);
    } else if (this.cursors.down.isDown) {
      this.player.setAccelerationY(acceleration);
    } else {
      this.player.setAccelerationY(0);
    }

    // 让每个敌人追踪玩家
    this.enemies.children.entries.forEach(enemy => {
      this.physics.moveToObject(enemy, this.player, 360);
    });
  }

  hitEnemy(player, enemy) {
    if (this.gameOver) {
      return;
    }

    // 游戏结束
    this.gameOver = true;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);

    // 显示最终存活时间
    this.add.text(400, 370, `You survived for ${this.survivalTime} seconds!`, {
      fontSize: '28px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 3秒后重启游戏
    this.time.delayedCall(3000, () => {
      this.scene.restart();
    });
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