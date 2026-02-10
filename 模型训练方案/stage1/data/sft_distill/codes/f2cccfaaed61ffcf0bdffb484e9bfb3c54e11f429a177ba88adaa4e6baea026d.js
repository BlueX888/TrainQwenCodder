class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界次数（验证信号）
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建灰色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（居中位置）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞

    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加WASD支持
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 显示状态信息
    this.statusText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 显示控制说明
    this.add.text(10, 550, 'Controls: Arrow Keys or WASD to move', {
      fontSize: '14px',
      fill: '#cccccc'
    });

    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);

    // 处理输入 - 移动速度 160
    const speed = 160;
    
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(speed);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(speed);
    }

    // 处理边界循环效果
    const padding = 16; // 玩家半径
    let crossed = false;

    // 左右边界
    if (this.player.x < -padding) {
      this.player.x = this.game.config.width + padding;
      crossed = true;
    } else if (this.player.x > this.game.config.width + padding) {
      this.player.x = -padding;
      crossed = true;
    }

    // 上下边界
    if (this.player.y < -padding) {
      this.player.y = this.game.config.height + padding;
      crossed = true;
    } else if (this.player.y > this.game.config.height + padding) {
      this.player.y = -padding;
      crossed = true;
    }

    // 更新穿越计数
    if (crossed) {
      this.crossCount++;
      this.updateStatusText();
    }
  }

  updateStatusText() {
    this.statusText.setText(
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})\n` +
      `Cross Count: ${this.crossCount}\n` +
      `Speed: 160`
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