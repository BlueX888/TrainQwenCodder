class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 循环次数计数器（状态信号）
    this.playerX = 0;   // 玩家X坐标（状态信号）
    this.playerY = 0;   // 玩家Y坐标（状态信号）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const PLAYER_SIZE = 32;
    const PLAYER_SPEED = 300;

    // 使用Graphics创建青色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00FFFF, 1); // 青色
    graphics.fillRect(0, 0, PLAYER_SIZE, PLAYER_SIZE);
    graphics.generateTexture('playerTexture', PLAYER_SIZE, PLAYER_SIZE);
    graphics.destroy();

    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      'playerTexture'
    );

    // 设置玩家物理属性
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    this.player.body.setDrag(0); // 无拖拽
    this.player.body.setMaxVelocity(PLAYER_SPEED, PLAYER_SPEED);

    // 创建方向键
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加调试文本显示状态
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 初始化状态
    this.updateStatus();
  }

  update(time, delta) {
    const PLAYER_SPEED = 300;

    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理键盘输入
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-PLAYER_SPEED);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(PLAYER_SPEED);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-PLAYER_SPEED);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(PLAYER_SPEED);
    }

    // 处理边界循环效果
    this.handleWorldWrap();

    // 更新状态信号
    this.updateStatus();
  }

  handleWorldWrap() {
    const worldWidth = this.cameras.main.width;
    const worldHeight = this.cameras.main.height;
    const playerHalfWidth = this.player.width / 2;
    const playerHalfHeight = this.player.height / 2;

    let wrapped = false;

    // 左右边界循环
    if (this.player.x < -playerHalfWidth) {
      this.player.x = worldWidth + playerHalfWidth;
      wrapped = true;
    } else if (this.player.x > worldWidth + playerHalfWidth) {
      this.player.x = -playerHalfWidth;
      wrapped = true;
    }

    // 上下边界循环
    if (this.player.y < -playerHalfHeight) {
      this.player.y = worldHeight + playerHalfHeight;
      wrapped = true;
    } else if (this.player.y > worldHeight + playerHalfHeight) {
      this.player.y = -playerHalfHeight;
      wrapped = true;
    }

    // 如果发生了循环，增加计数
    if (wrapped) {
      this.wrapCount++;
    }
  }

  updateStatus() {
    // 更新状态信号
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新调试文本
    this.debugText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: 300`,
      '',
      'Use Arrow Keys to Move'
    ]);
  }
}

// Phaser游戏配置
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

// 创建游戏实例
const game = new Phaser.Game(config);