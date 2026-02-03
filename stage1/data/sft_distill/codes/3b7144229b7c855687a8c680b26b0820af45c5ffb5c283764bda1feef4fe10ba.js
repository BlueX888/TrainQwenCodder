class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 80 * 1.2; // 96
    this.enemySpeed = 80;
    this.catchCount = 0;
    this.escapeCount = 0;
    this.gameTime = 0;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 初始化信号对象
    window.__signals__ = {
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      catchCount: 0,
      escapeCount: 0,
      distance: 0,
      gameTime: 0,
      playerPos: { x: 0, y: 0 },
      enemyPos: { x: 0, y: 0 }
    };

    // 创建玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0000ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建敌人纹理（绿色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0x00ff00, 1);
    enemyGraphics.fillCircle(16, 16, 16);
    enemyGraphics.generateTexture('enemy', 32, 32);
    enemyGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人精灵
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 添加提示文本
    this.add.text(10, 10, 'Arrow Keys to Move', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.statusText = this.add.text(10, 30, '', {
      fontSize: '14px',
      fill: '#ffffff'
    });

    this.distanceText = this.add.text(10, 50, '', {
      fontSize: '14px',
      fill: '#ffff00'
    });

    // 记录初始日志
    console.log(JSON.stringify({
      event: 'game_start',
      playerSpeed: this.playerSpeed,
      enemySpeed: this.enemySpeed,
      timestamp: Date.now()
    }));
  }

  update(time, delta) {
    this.gameTime += delta;

    // 玩家移动控制
    this.player.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 对角线移动时归一化速度
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalized = this.player.body.velocity.normalize();
      this.player.setVelocity(
        normalized.x * this.playerSpeed,
        normalized.y * this.playerSpeed
      );
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离
    const distance = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.enemy.x,
      this.enemy.y
    );

    // 更新信号
    window.__signals__.distance = Math.round(distance);
    window.__signals__.gameTime = Math.round(this.gameTime / 1000);
    window.__signals__.playerPos = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };
    window.__signals__.enemyPos = {
      x: Math.round(this.enemy.x),
      y: Math.round(this.enemy.y)
    };

    // 如果玩家成功保持距离超过5秒，增加逃脱计数
    if (distance > 150 && this.gameTime % 5000 < delta) {
      this.escapeCount++;
      window.__signals__.escapeCount = this.escapeCount;
      console.log(JSON.stringify({
        event: 'escape',
        escapeCount: this.escapeCount,
        distance: Math.round(distance),
        timestamp: Date.now()
      }));
    }

    // 更新显示文本
    this.statusText.setText(
      `Caught: ${this.catchCount} | Escaped: ${this.escapeCount} | Time: ${Math.floor(this.gameTime / 1000)}s`
    );
    this.distanceText.setText(`Distance: ${Math.round(distance)}px`);
  }

  onCatch() {
    this.catchCount++;
    window.__signals__.catchCount = this.catchCount;

    // 记录捕获事件
    console.log(JSON.stringify({
      event: 'player_caught',
      catchCount: this.catchCount,
      gameTime: Math.round(this.gameTime / 1000),
      timestamp: Date.now()
    }));

    // 重置玩家位置
    this.player.setPosition(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );

    // 重置敌人位置到远处
    this.enemy.setPosition(
      Phaser.Math.Between(50, 750),
      Phaser.Math.Between(50, 550)
    );

    // 确保它们不会重叠生成
    const minDistance = 200;
    while (Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    ) < minDistance) {
      this.enemy.setPosition(
        Phaser.Math.Between(50, 750),
        Phaser.Math.Between(50, 550)
      );
    }
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