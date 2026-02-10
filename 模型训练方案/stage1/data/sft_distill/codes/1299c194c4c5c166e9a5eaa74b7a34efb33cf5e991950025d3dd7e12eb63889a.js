class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerSpeed = 300 * 1.2; // 360
    this.enemySpeed = 300;
    this.catchCount = 0; // 状态信号：被追上次数
    this.escapeTime = 0; // 状态信号：成功躲避时间
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 生成玩家纹理（蓝色方块）
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x0088ff, 1);
    playerGraphics.fillRect(0, 0, 32, 32);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 生成敌人纹理（粉色圆形）
    const enemyGraphics = this.add.graphics();
    enemyGraphics.fillStyle(0xff69b4, 1); // 粉色
    enemyGraphics.fillCircle(20, 20, 20);
    enemyGraphics.generateTexture('enemy', 40, 40);
    enemyGraphics.destroy();

    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建敌人
    this.enemy = this.physics.add.sprite(100, 100, 'enemy');
    this.enemy.setCollideWorldBounds(true);

    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 碰撞检测
    this.physics.add.overlap(this.player, this.enemy, this.onCatch, null, this);

    // 显示状态信息
    this.statusText = this.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加提示文本
    this.add.text(400, 550, '使用方向键或 WASD 移动，躲避粉色敌人！', {
      fontSize: '16px',
      fill: '#ffffff'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    // 更新状态文本
    this.statusText.setText([
      `被追上次数: ${this.catchCount}`,
      `躲避时间: ${(this.escapeTime / 1000).toFixed(1)}s`,
      `玩家速度: ${this.playerSpeed}`,
      `敌人速度: ${this.enemySpeed}`
    ]);

    // 玩家移动控制
    this.player.setVelocity(0);

    let moving = false;
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
      moving = true;
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(this.playerSpeed);
      moving = true;
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
      moving = true;
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(this.playerSpeed);
      moving = true;
    }

    // 对角线移动时标准化速度
    if (moving) {
      this.player.body.velocity.normalize().scale(this.playerSpeed);
    }

    // 敌人追踪玩家
    this.physics.moveToObject(this.enemy, this.player, this.enemySpeed);

    // 计算距离，如果没有碰撞则累加躲避时间
    const distance = Phaser.Math.Distance.Between(
      this.player.x, this.player.y,
      this.enemy.x, this.enemy.y
    );

    if (distance > 40) { // 超过碰撞范围
      this.escapeTime += delta;
    }
  }

  onCatch() {
    // 被追上时的处理
    this.catchCount++;
    
    // 重置位置
    this.player.setPosition(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );
    this.enemy.setPosition(
      Phaser.Math.Between(100, 700),
      Phaser.Math.Between(100, 500)
    );

    // 短暂闪烁效果
    this.player.setAlpha(0.5);
    this.time.delayedCall(200, () => {
      this.player.setAlpha(1);
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