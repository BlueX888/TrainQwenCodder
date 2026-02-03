class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 记录循环次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建黄色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家物理精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示文本用于验证状态
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化状态
    this.updateStatus();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 根据键盘输入设置速度 240
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-240);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(240);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-240);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(240);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      const normalizedSpeed = 240 / Math.sqrt(2);
      this.player.setVelocity(
        this.player.body.velocity.x > 0 ? normalizedSpeed : -normalizedSpeed,
        this.player.body.velocity.y > 0 ? normalizedSpeed : -normalizedSpeed
      );
    }

    // 边界循环逻辑
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;

    let wrapped = false;

    // 左右边界循环
    if (this.player.x < -playerWidth / 2) {
      this.player.x = worldWidth + playerWidth / 2;
      wrapped = true;
    } else if (this.player.x > worldWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    }

    // 上下边界循环
    if (this.player.y < -playerHeight / 2) {
      this.player.y = worldHeight + playerHeight / 2;
      wrapped = true;
    } else if (this.player.y > worldHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    }

    // 如果发生了循环，增加计数
    if (wrapped) {
      this.wrapCount++;
    }

    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.setText([
      `Player Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 240`,
      '',
      'Use Arrow Keys to Move'
    ]);
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);