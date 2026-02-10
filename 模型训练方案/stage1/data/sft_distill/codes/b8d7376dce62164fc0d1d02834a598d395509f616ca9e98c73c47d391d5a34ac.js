class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 循环次数计数器（用于验证）
  }

  preload() {
    // 使用 Graphics 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞，允许移出
    
    // 创建方向键控制
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

    // 添加边界提示
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0xff0000, 0.5);
    graphics.strokeRect(0, 0, 800, 600);
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制（方向键或 WASD）
    if (this.cursors.left.isDown || this.keys.A.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown || this.keys.D.isDown) {
      this.player.setVelocityX(200);
    }

    if (this.cursors.up.isDown || this.keys.W.isDown) {
      this.player.setVelocityY(-200);
    } else if (this.cursors.down.isDown || this.keys.S.isDown) {
      this.player.setVelocityY(200);
    }

    // 处理边界循环（玩家从一边移出，从对侧出现）
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    const worldWidth = this.scale.width;
    const worldHeight = this.scale.height;

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

    // 循环时增加计数
    if (wrapped) {
      this.wrapCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新状态显示
    this.statusText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      '',
      'Controls: Arrow Keys or WASD',
      'Speed: 200 px/s'
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
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);