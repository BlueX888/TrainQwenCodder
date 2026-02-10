class GravityScene extends Phaser.Scene {
  constructor() {
    super('GravityScene');
    this.gravityDirection = 'down'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // 创建玩家纹理（使用 Graphics）
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();

    // 创建玩家精灵（带物理）
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setBounce(0.3);
    this.player.setCollideWorldBounds(true);

    // 设置初始重力向下
    this.physics.world.gravity.y = 200;

    // 创建地板（视觉参考）
    const floor = this.add.graphics();
    floor.fillStyle(0x666666, 1);
    floor.fillRect(0, height - 20, width, 20);

    // 创建天花板（视觉参考）
    const ceiling = this.add.graphics();
    ceiling.fillStyle(0x666666, 1);
    ceiling.fillRect(0, 0, width, 20);

    // 创建状态显示文本
    this.gravityText = this.add.text(20, 40, '', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchText = this.add.text(20, 80, '', {
      fontSize: '18px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.instructionText = this.add.text(20, 120, 'Click to switch gravity', {
      fontSize: '16px',
      color: '#aaaaaa',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 更新显示
    this.updateGravityDisplay();

    // 监听鼠标左键点击
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 添加调试信息
    console.log('Game initialized - Gravity:', this.gravityDirection);
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'down') {
      this.gravityDirection = 'up';
      this.physics.world.gravity.y = -200;
    } else {
      this.gravityDirection = 'down';
      this.physics.world.gravity.y = 200;
    }

    this.switchCount++;
    this.updateGravityDisplay();

    // 给玩家一个小的初始速度，使效果更明显
    const initialVelocity = this.gravityDirection === 'down' ? 50 : -50;
    this.player.setVelocityY(initialVelocity);

    console.log('Gravity switched to:', this.gravityDirection, '| Count:', this.switchCount);
  }

  updateGravityDisplay() {
    const arrow = this.gravityDirection === 'down' ? '↓' : '↑';
    const color = this.gravityDirection === 'down' ? '#ff6666' : '#66ccff';
    
    this.gravityText.setText(`Gravity: ${arrow} ${this.gravityDirection.toUpperCase()}`);
    this.gravityText.setColor(color);
    
    this.switchText.setText(`Switches: ${this.switchCount}`);
  }

  update(time, delta) {
    // 显示玩家位置（用于验证）
    const posY = Math.round(this.player.y);
    const velY = Math.round(this.player.body.velocity.y);
    
    // 可选：添加位置和速度显示
    if (!this.debugText) {
      this.debugText = this.add.text(20, this.scale.height - 40, '', {
        fontSize: '14px',
        color: '#00ff00',
        backgroundColor: '#000000',
        padding: { x: 5, y: 3 }
      });
    }
    
    this.debugText.setText(`Pos: ${posY} | Vel: ${velY}`);

    // 边界检测（额外保护）
    if (this.player.y < 30) {
      this.player.y = 30;
      this.player.setVelocityY(Math.abs(this.player.body.velocity.y) * 0.5);
    } else if (this.player.y > this.scale.height - 30) {
      this.player.y = this.scale.height - 30;
      this.player.setVelocityY(-Math.abs(this.player.body.velocity.y) * 0.5);
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 200 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态访问接口（用于测试验证）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    gravityDirection: scene.gravityDirection,
    switchCount: scene.switchCount,
    playerY: Math.round(scene.player.y),
    gravityY: scene.physics.world.gravity.y
  };
};