class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    // 状态信号变量
    this.playerX = 0;
    this.playerY = 0;
    this.wrapCount = 0; // 记录穿越边界次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 使用 Graphics 创建橙色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xFF8C00, 1); // 橙色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理精灵玩家
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(false); // 不与边界碰撞，允许移出
    
    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加显示信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界提示
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xFFFFFF, 0.5);
    borderGraphics.strokeRect(0, 0, width, height);
  }

  update(time, delta) {
    const speed = 200;
    
    // 重置速度
    this.player.setVelocity(0);

    // 键盘控制
    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      this.player.setVelocityY(speed);
    }

    // 记录穿越前的位置
    const prevX = this.player.x;
    const prevY = this.player.y;

    // 循环地图效果：玩家移出边界时从对侧出现
    // wrap(gameObject, padding) - padding 为边界外的额外距离
    this.physics.world.wrap(this.player, 16);

    // 检测是否发生了穿越
    const { width, height } = this.cameras.main;
    if (Math.abs(this.player.x - prevX) > width / 2 || 
        Math.abs(this.player.y - prevY) > height / 2) {
      this.wrapCount++;
    }

    // 更新状态变量
    this.playerX = Math.round(this.player.x);
    this.playerY = Math.round(this.player.y);

    // 更新显示信息
    this.infoText.setText([
      `Position: (${this.playerX}, ${this.playerY})`,
      `Wrap Count: ${this.wrapCount}`,
      `Speed: ${speed}`,
      '',
      'Controls: Arrow Keys or WASD',
      'Move out of bounds to wrap around'
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