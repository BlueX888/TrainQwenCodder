class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 1; // 1表示向下，-1表示向上
    this.gravityValue = 300;
  }

  preload() {
    // 使用Graphics创建玩家纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵，初始位置在屏幕中央
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);
    this.player.setBounce(0.3);
    
    // 设置初始重力（向下）
    this.player.body.setGravityY(this.gravityValue * this.gravityDirection);

    // 创建文本显示当前重力方向
    this.gravityText = this.add.text(16, 16, '', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.updateGravityText();

    // 创建提示文本
    this.add.text(16, 60, 'Right Click: Toggle Gravity', {
      fontSize: '18px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 监听鼠标右键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加键盘控制（可选，用于左右移动）
    this.cursors = this.input.keyboard.createCursorKeys();

    // 添加状态信号变量（用于验证）
    this.gravityToggleCount = 0;
    this.playerYPosition = this.player.y;

    // 创建状态显示文本
    this.statusText = this.add.text(16, 100, '', {
      fontSize: '16px',
      fill: '#00ffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
  }

  toggleGravity() {
    // 切换重力方向
    this.gravityDirection *= -1;
    this.player.body.setGravityY(this.gravityValue * this.gravityDirection);
    
    // 更新切换次数
    this.gravityToggleCount++;
    
    // 更新显示文本
    this.updateGravityText();
    
    // 给玩家一个初始速度，使效果更明显
    this.player.setVelocityY(this.gravityDirection * -100);
  }

  updateGravityText() {
    const direction = this.gravityDirection === 1 ? 'DOWN ↓' : 'UP ↑';
    const gravityAmount = Math.abs(this.gravityValue * this.gravityDirection);
    this.gravityText.setText(`Gravity: ${direction} (${gravityAmount})`);
  }

  update(time, delta) {
    // 左右移动控制
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-200);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(200);
    } else {
      this.player.setVelocityX(0);
    }

    // 更新状态信息
    this.playerYPosition = Math.round(this.player.y);
    this.statusText.setText(
      `Toggle Count: ${this.gravityToggleCount}\n` +
      `Player Y: ${this.playerYPosition}\n` +
      `Velocity Y: ${Math.round(this.player.body.velocity.y)}`
    );

    // 如果玩家碰到顶部或底部边界，稍微减速
    if (this.player.body.blocked.up || this.player.body.blocked.down) {
      this.player.setVelocityY(this.player.body.velocity.y * 0.5);
    }
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
      gravity: { y: 0 }, // 全局重力设为0，由玩家自身重力控制
      debug: false
    }
  },
  scene: GravityScene
};

new Phaser.Game(config);