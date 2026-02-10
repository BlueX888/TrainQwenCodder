class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.wrapCount = 0; // 记录穿越边界次数
  }

  preload() {
    // 使用 Graphics 创建绿色玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（位于屏幕中心）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 设置移动速度
    this.moveSpeed = 300;
    
    // 创建键盘输入
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 添加提示文本
    this.add.text(10, 10, 'Use Arrow Keys or WASD to move', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    this.statusText = this.add.text(10, 30, 'Wraps: 0', {
      fontSize: '16px',
      color: '#ffffff'
    });
    
    // 初始化可验证信号
    window.__signals__ = {
      wrapCount: 0,
      playerX: 400,
      playerY: 300,
      lastWrapSide: null
    };
    
    console.log(JSON.stringify({
      type: 'game_start',
      timestamp: Date.now(),
      playerSpeed: this.moveSpeed
    }));
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
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
    let wrapped = false;
    let wrapSide = null;
    
    // 左右边界检测
    if (this.player.x < -playerHalfWidth) {
      this.player.x = this.game.config.width + playerHalfWidth;
      wrapped = true;
      wrapSide = 'left';
    } else if (this.player.x > this.game.config.width + playerHalfWidth) {
      this.player.x = -playerHalfWidth;
      wrapped = true;
      wrapSide = 'right';
    }
    
    // 上下边界检测
    if (this.player.y < -playerHalfHeight) {
      this.player.y = this.game.config.height + playerHalfHeight;
      wrapped = true;
      wrapSide = wrapSide ? wrapSide + '+top' : 'top';
    } else if (this.player.y > this.game.config.height + playerHalfHeight) {
      this.player.y = -playerHalfHeight;
      wrapped = true;
      wrapSide = wrapSide ? wrapSide + '+bottom' : 'bottom';
    }
    
    // 如果发生了边界穿越，更新计数器
    if (wrapped) {
      this.wrapCount++;
      this.statusText.setText('Wraps: ' + this.wrapCount);
      
      // 更新可验证信号
      window.__signals__.wrapCount = this.wrapCount;
      window.__signals__.lastWrapSide = wrapSide;
      
      // 输出日志
      console.log(JSON.stringify({
        type: 'player_wrap',
        timestamp: Date.now(),
        wrapCount: this.wrapCount,
        side: wrapSide,
        newPosition: {
          x: Math.round(this.player.x),
          y: Math.round(this.player.y)
        }
      }));
    }
    
    // 更新玩家位置信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
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