class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 状态信号：记录循环次数
    this.playerSpeed = 80;
  }

  preload() {
    // 使用 Graphics 创建白色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffffff, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵，初始位置在画布中心
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff'
    });

    // 绘制边界参考线
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0x00ff00, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入 - 方向键或 WASD
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-this.playerSpeed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(this.playerSpeed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-this.playerSpeed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(this.playerSpeed);
    }

    // 处理边界循环（wrap around）
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const gameWidth = this.cameras.main.width;
    const gameHeight = this.cameras.main.height;

    let wrapped = false;

    // 左右边界检测
    if (this.player.x > gameWidth + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      wrapped = true;
    } else if (this.player.x < -playerWidth / 2) {
      this.player.x = gameWidth + playerWidth / 2;
      wrapped = true;
    }

    // 上下边界检测
    if (this.player.y > gameHeight + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      wrapped = true;
    } else if (this.player.y < -playerHeight / 2) {
      this.player.y = gameHeight + playerHeight / 2;
      wrapped = true;
    }

    // 如果发生了循环，增加计数
    if (wrapped) {
      this.wrapCount++;
    }

    // 更新状态显示
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: ${this.playerSpeed}`,
      `Use Arrow Keys or WASD to move`
    ]);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
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