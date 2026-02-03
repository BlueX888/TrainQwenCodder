class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.cursors = null;
    this.moveSpeed = 80;
    this.crossCount = 0; // 穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建灰色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('playerTex', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵，位于屏幕中心
    this.player = this.physics.add.sprite(400, 300, 'playerTex');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
    
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
      moveSpeed: this.moveSpeed,
      lastCrossDirection: 'none'
    };
    
    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    
    this.add.text(10, 30, 'Player wraps around screen edges', {
      fontSize: '16px',
      fill: '#ffffff'
    });
    
    // 显示穿越次数
    this.crossText = this.add.text(10, 50, 'Crosses: 0', {
      fontSize: '16px',
      fill: '#ffff00'
    });
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-this.moveSpeed);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(this.moveSpeed);
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-this.moveSpeed);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(this.moveSpeed);
    }
    
    // 处理边界循环（wrap around）
    const playerHalfWidth = this.player.width / 2;
    const playerHalfHeight = this.player.height / 2;
    
    let crossed = false;
    let crossDirection = 'none';
    
    // 左右边界检测
    if (this.player.x < -playerHalfWidth) {
      this.player.x = this.game.config.width + playerHalfWidth;
      crossed = true;
      crossDirection = 'left-to-right';
    } else if (this.player.x > this.game.config.width + playerHalfWidth) {
      this.player.x = -playerHalfWidth;
      crossed = true;
      crossDirection = 'right-to-left';
    }
    
    // 上下边界检测
    if (this.player.y < -playerHalfHeight) {
      this.player.y = this.game.config.height + playerHalfHeight;
      crossed = true;
      crossDirection = 'top-to-bottom';
    } else if (this.player.y > this.game.config.height + playerHalfHeight) {
      this.player.y = -playerHalfHeight;
      crossed = true;
      crossDirection = 'bottom-to-top';
    }
    
    // 如果发生边界穿越，更新计数
    if (crossed) {
      this.crossCount++;
      this.crossText.setText('Crosses: ' + this.crossCount);
      console.log(JSON.stringify({
        event: 'boundary_cross',
        count: this.crossCount,
        direction: crossDirection,
        position: { x: this.player.x, y: this.player.y }
      }));
    }
    
    // 更新信号对象
    window.__signals__ = {
      playerX: Math.round(this.player.x * 100) / 100,
      playerY: Math.round(this.player.y * 100) / 100,
      crossCount: this.crossCount,
      moveSpeed: this.moveSpeed,
      lastCrossDirection: crossed ? crossDirection : window.__signals__.lastCrossDirection,
      velocityX: this.player.body.velocity.x,
      velocityY: this.player.body.velocity.y
    };
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