class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录穿越边界次数
    this.playerSpeed = 120;
  }

  preload() {
    // 使用Graphics生成红色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 50, 'Controls: Arrow Keys or WASD', {
      fontSize: '14px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理输入
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 实现循环地图效果
    const halfWidth = this.player.width / 2;
    const halfHeight = this.player.height / 2;
    let wrapped = false;

    // 水平边界检测
    if (this.player.x < -halfWidth) {
      this.player.x = this.scale.width + halfWidth;
      wrapped = true;
    } else if (this.player.x > this.scale.width + halfWidth) {
      this.player.x = -halfWidth;
      wrapped = true;
    }

    // 垂直边界检测
    if (this.player.y < -halfHeight) {
      this.player.y = this.scale.height + halfHeight;
      wrapped = true;
    } else if (this.player.y > this.scale.height + halfHeight) {
      this.player.y = -halfHeight;
      wrapped = true;
    }

    // 更新穿越计数
    if (wrapped) {
      this.wrapCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Wrap Count: ${this.wrapCount}\n` +
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Speed: ${this.playerSpeed}`
    );
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