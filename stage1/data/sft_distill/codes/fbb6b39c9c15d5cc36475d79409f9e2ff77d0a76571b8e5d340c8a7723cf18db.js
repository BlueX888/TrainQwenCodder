class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵
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

    // 初始化信号对象
    window.__signals__ = {
      playerX: this.player.x,
      playerY: this.player.y,
      crossCount: this.crossCount,
      speed: 80,
      worldWidth: this.scale.width,
      worldHeight: this.scale.height,
      events: []
    };

    // 添加文本显示
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  update(time, delta) {
    const speed = 80;
    
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
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

    // 边界循环检测
    const margin = 16; // 玩家半径
    let crossed = false;
    let direction = '';

    // 左右边界
    if (this.player.x < -margin) {
      this.player.x = this.scale.width + margin;
      crossed = true;
      direction = 'left->right';
    } else if (this.player.x > this.scale.width + margin) {
      this.player.x = -margin;
      crossed = true;
      direction = 'right->left';
    }

    // 上下边界
    if (this.player.y < -margin) {
      this.player.y = this.scale.height + margin;
      crossed = true;
      direction += (direction ? ' & ' : '') + 'top->bottom';
    } else if (this.player.y > this.scale.height + margin) {
      this.player.y = -margin;
      crossed = true;
      direction += (direction ? ' & ' : '') + 'bottom->top';
    }

    // 记录穿越事件
    if (crossed) {
      this.crossCount++;
      const event = {
        time: time,
        count: this.crossCount,
        direction: direction,
        position: { x: Math.round(this.player.x), y: Math.round(this.player.y) }
      };
      window.__signals__.events.push(event);
      console.log('[CROSS]', JSON.stringify(event));
    }

    // 更新信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    window.__signals__.crossCount = this.crossCount;

    // 更新显示文本
    this.infoText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Speed: ${speed}`,
      `Cross Count: ${this.crossCount}`,
      `Use Arrow Keys or WASD to move`
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

const game = new Phaser.Game(config);

// 输出初始化日志
console.log('[INIT]', JSON.stringify({
  gameSize: { width: config.width, height: config.height },
  playerSpeed: 80,
  feature: 'wrap-around-world'
}));