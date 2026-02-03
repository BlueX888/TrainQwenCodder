class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界次数
    this.playerX = 0;
    this.playerY = 0;
  }

  preload() {
    // 使用 Graphics 创建绿色方块纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（位于屏幕中央）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 允许移出边界
    
    // 创建方向键控制
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // 添加 WASD 键支持
    this.keys = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
    
    // 创建信息文本
    this.infoText = this.add.text(10, 10, '', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    // 初始化信号对象
    window.__signals__ = {
      crossCount: 0,
      playerX: 400,
      playerY: 300,
      lastCrossDirection: 'none'
    };
    
    this.updateInfoText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0, 0);
    
    // 处理键盘输入
    const speed = 300;
    
    if (this.cursors.left.isDown || this.keys.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown || this.keys.right.isDown) {
      this.player.setVelocityX(speed);
    }
    
    if (this.cursors.up.isDown || this.keys.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown || this.keys.down.isDown) {
      this.player.setVelocityY(speed);
    }
    
    // 边界循环检测
    const padding = 16; // 玩家半径
    let crossed = false;
    let direction = '';
    
    // 左边界
    if (this.player.x < -padding) {
      this.player.x = this.game.config.width + padding;
      crossed = true;
      direction = 'left';
    }
    // 右边界
    else if (this.player.x > this.game.config.width + padding) {
      this.player.x = -padding;
      crossed = true;
      direction = 'right';
    }
    
    // 上边界
    if (this.player.y < -padding) {
      this.player.y = this.game.config.height + padding;
      crossed = true;
      direction = direction ? direction + '-top' : 'top';
    }
    // 下边界
    else if (this.player.y > this.game.config.height + padding) {
      this.player.y = -padding;
      crossed = true;
      direction = direction ? direction + '-bottom' : 'bottom';
    }
    
    // 记录穿越事件
    if (crossed) {
      this.crossCount++;
      console.log(JSON.stringify({
        event: 'boundary_cross',
        count: this.crossCount,
        direction: direction,
        timestamp: time
      }));
      
      // 更新信号
      window.__signals__.crossCount = this.crossCount;
      window.__signals__.lastCrossDirection = direction;
    }
    
    // 更新玩家位置信号
    window.__signals__.playerX = Math.round(this.player.x);
    window.__signals__.playerY = Math.round(this.player.y);
    
    this.updateInfoText();
  }
  
  updateInfoText() {
    this.infoText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Cross Count: ${this.crossCount}`,
      `Speed: 300`,
      `Controls: Arrow Keys or WASD`
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