class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.survivalTime = 0; // 可验证状态：存活时间
    this.isGameOver = false;
  }

  preload() {
    // 使用Graphics生成纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理（绿色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（红色方块）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff0000, 1);
    enemyGraphics.fillRect(0, 0, 28, 28);
    enemyGraphics.generateTexture('enemy', 28, 28);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.body.setMaxVelocity(200, 200);

    // 创建敌人组
    this.enemies = this.physics.add.group();
    
    // 生成3个敌人在不同位置
    const enemyPositions = [
      { x: 100, y: 100 },
      { x: 700, y: 100 },
      { x: 400, y: 500 }
    ];

    enemyPositions.forEach(pos => {
      const enemy = this.enemies.create(pos.x, pos.y, 'enemy');
      enemy.setCollideWorldBounds(true);
    });

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    // 键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 显示存活时间文本
    this.timeText = this.add.text(16, 16, 'Time: 0s', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 游戏说明
    this.add.text(16, 50, 'Use Arrow Keys to Move', {
      fontSize: '18px',
      fill: '#ffffff'
    });

    // 游戏结束文本（初始隐藏）
    this.gameOverText = this.add.text(400, 300, 'GAME OVER!', {
      fontSize: '48px',
      fill: '#ff0000'
    });
    this.gameOverText.setOrigin(0.5);
    this.gameOverText.setVisible(false);

    // 记录游戏开始时间
    this.startTime = this.time.now;
  }

  update(time, delta) {
    if (this.isGameOver) {
      return;
    }

    // 更新存活时间
    this.survivalTime = Math.floor((time - this.startTime) / 1000);
    this.timeText.setText(`Time: ${this.survivalTime}s`);

    // 玩家移动控制
    const acceleration = 500;
    const drag = 400;

    this.player.setDrag(drag);

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

    // 敌人追踪玩家逻辑
    this.enemies.children.entries.forEach(enemy => {
      // 计算敌人到玩家的方向
      const angle = Phaser.Math.Angle.Between(
        enemy.x,
        enemy.y,
        this.player.x,
        this.player.y
      );

      // 设置敌人速度为160，朝向玩家
      const speed = 160;
      enemy.setVelocity(
        Math.cos(angle) * speed,
        Math.sin(angle) * speed
      );

      // 旋转敌人面向玩家
      enemy.rotation = angle;
    });
  }

  hitEnemy(player, enemy) {
    if (this.isGameOver) {
      return;
    }

    // 游戏结束
    this.isGameOver = true;

    // 停止所有物理对象
    this.physics.pause();

    // 玩家变红
    player.setTint(0xff0000);

    // 显示游戏结束文本
    this.gameOverText.setVisible(true);
    this.gameOverText.setText(`GAME OVER!\nSurvived: ${this.survivalTime}s`);

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