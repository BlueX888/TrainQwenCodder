class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossBorderCount = 0; // 可验证的状态信号：穿越边界次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建橙色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8800, 1); // 橙色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTexture', 32, 32);
    graphics.destroy();

    // 创建玩家物理精灵
    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
    
    // 设置玩家移动速度常量
    this.playerSpeed = 200;

    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加显示信息的文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    this.updateInfoText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 根据方向键控制移动
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

    // 边界循环逻辑
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    let crossed = false;

    // 左边界检测
    if (this.player.x + playerWidth / 2 < 0) {
      this.player.x = gameWidth + playerWidth / 2;
      crossed = true;
    }
    // 右边界检测
    else if (this.player.x - playerWidth / 2 > gameWidth) {
      this.player.x = -playerWidth / 2;
      crossed = true;
    }

    // 上边界检测
    if (this.player.y + playerHeight / 2 < 0) {
      this.player.y = gameHeight + playerHeight / 2;
      crossed = true;
    }
    // 下边界检测
    else if (this.player.y - playerHeight / 2 > gameHeight) {
      this.player.y = -playerHeight / 2;
      crossed = true;
    }

    // 如果穿越了边界，增加计数
    if (crossed) {
      this.crossBorderCount++;
      this.updateInfoText();
    }
  }

  updateInfoText() {
    this.infoText.setText([
      'Use Arrow Keys to Move',
      `Speed: ${this.playerSpeed}`,
      `Border Crosses: ${this.crossBorderCount}`,
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`
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