class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 用于验证循环次数的状态信号
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 程序化生成紫色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932CC, 1); // 紫色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出边界

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      W: Phaser.Input.Keyboard.KeyCodes.W,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      S: Phaser.Input.Keyboard.KeyCodes.S,
      D: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    const speed = 300;

    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(speed);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(speed);
    }

    // 边界循环逻辑
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    let wrapped = false;

    // 水平边界循环
    if (this.player.x > this.scale.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = this.scale.width + playerWidth / 2;
      wrapped = true;
    }

    // 垂直边界循环
    if (this.player.y > this.scale.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = this.scale.height + playerHeight / 2;
      wrapped = true;
    }

    // 更新循环计数
    if (wrapped) {
      this.wrapCount++;
    }

    // 更新状态显示
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);
    this.updateStatusText();
  }

  updateStatusText() {
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 300`,
      ``,
      `Controls: Arrow Keys or WASD`
    ]);
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