class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.crossCount = 0; // 穿越边界次数（状态信号）
  }

  preload() {
    // 使用 Graphics 创建灰色玩家纹理
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    graphics.fillStyle(0x808080, 1); // 灰色
    graphics.fillRect(0, 0, 32, 32);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    // 创建玩家精灵（使用物理系统）
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(false); // 不与世界边界碰撞，允许移出
    
    // 创建键盘控制
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
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    
    this.updateStatusText();
  }

  update(time, delta) {
    // 重置速度
    this.player.setVelocity(0);
    
    // 处理键盘输入
    if (this.cursors.left.isDown || this.keys.a.isDown) {
      this.player.setVelocityX(-160);
    } else if (this.cursors.right.isDown || this.keys.d.isDown) {
      this.player.setVelocityX(160);
    }
    
    if (this.cursors.up.isDown || this.keys.w.isDown) {
      this.player.setVelocityY(-160);
    } else if (this.cursors.down.isDown || this.keys.s.isDown) {
      this.player.setVelocityY(160);
    }
    
    // 循环地图效果 - 检测边界并从对侧出现
    const playerWidth = this.player.width;
    const playerHeight = this.player.height;
    
    // 左边界 -> 右边界
    if (this.player.x < -playerWidth / 2) {
      this.player.x = this.game.config.width + playerWidth / 2;
      this.crossCount++;
      this.updateStatusText();
    }
    
    // 右边界 -> 左边界
    if (this.player.x > this.game.config.width + playerWidth / 2) {
      this.player.x = -playerWidth / 2;
      this.crossCount++;
      this.updateStatusText();
    }
    
    // 上边界 -> 下边界
    if (this.player.y < -playerHeight / 2) {
      this.player.y = this.game.config.height + playerHeight / 2;
      this.crossCount++;
      this.updateStatusText();
    }
    
    // 下边界 -> 上边界
    if (this.player.y > this.game.config.height + playerHeight / 2) {
      this.player.y = -playerHeight / 2;
      this.crossCount++;
      this.updateStatusText();
    }
  }
  
  updateStatusText() {
    this.statusText.setText([
      `Position: (${Math.round(this.player.x)}, ${Math.round(this.player.y)})`,
      `Cross Count: ${this.crossCount}`,
      `Speed: 160`,
      ``,
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

new Phaser.Game(config);