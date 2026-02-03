// 全局信号对象，用于验证
window.__signals__ = {
  playerPosition: { x: 0, y: 0 },
  wrapCount: 0,
  speed: 300,
  lastWrapDirection: null,
  timestamp: 0
};

class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.wrapCount = 0;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建绿色玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建物理精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 关闭世界边界碰撞以实现循环

    // 设置键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 控制
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });

    // 添加调试文本
    this.debugText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 添加边界标记
    const borderGraphics = this.add.graphics();
    borderGraphics.lineStyle(2, 0xffffff, 0.5);
    borderGraphics.strokeRect(0, 0, 800, 600);

    console.log('Game started - Player can wrap around edges');
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);

    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-300);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(300);
    }

    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-300);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(300);
    }

    // 处理对角线移动时的速度归一化
    if (this.player.body.velocity.x !== 0 && this.player.body.velocity.y !== 0) {
      this.player.body.velocity.normalize().scale(300);
    }

    // 边界循环检测
    const playerBounds = this.player.getBounds();
    let wrapped = false;
    let wrapDirection = null;

    // 左右边界
    if (playerBounds.right < 0) {
      this.player.x = 800 + this.player.width / 2;
      wrapped = true;
      wrapDirection = 'left-to-right';
    } else if (playerBounds.left > 800) {
      this.player.x = -this.player.width / 2;
      wrapped = true;
      wrapDirection = 'right-to-left';
    }

    // 上下边界
    if (playerBounds.bottom < 0) {
      this.player.y = 600 + this.player.height / 2;
      wrapped = true;
      wrapDirection = wrapDirection ? wrapDirection + '+bottom-to-top' : 'bottom-to-top';
    } else if (playerBounds.top > 600) {
      this.player.y = -this.player.height / 2;
      wrapped = true;
      wrapDirection = wrapDirection ? wrapDirection + '+top-to-bottom' : 'top-to-bottom';
    }

    // 记录循环事件
    if (wrapped) {
      this.wrapCount++;
      window.__signals__.wrapCount = this.wrapCount;
      window.__signals__.lastWrapDirection = wrapDirection;
      window.__signals__.timestamp = time;

      console.log(JSON.stringify({
        event: 'player_wrapped',
        wrapCount: this.wrapCount,
        direction: wrapDirection,
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) },
        time: Math.round(time)
      }));
    }

    // 更新全局信号
    window.__signals__.playerPosition = {
      x: Math.round(this.player.x),
      y: Math.round(this.player.y)
    };

    // 更新调试文本
    this.debugText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Velocity: (${Math.round(this.player.body.velocity.x)}, ${Math.round(this.player.body.velocity.y)})`,
      `Wrap Count: ${this.wrapCount}`,
      `Last Wrap: ${window.__signals__.lastWrapDirection || 'None'}`,
      '',
      'Controls: Arrow Keys or WASD'
    ]);
  }
}

// 游戏配置
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

// 启动游戏
const game = new Phaser.Game(config);

// 输出初始信号
console.log(JSON.stringify({
  event: 'game_initialized',
  config: {
    width: 800,
    height: 600,
    playerSpeed: 300
  }
}));