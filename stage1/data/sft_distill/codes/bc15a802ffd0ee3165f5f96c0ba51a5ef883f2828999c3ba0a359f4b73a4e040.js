class GravityToggleScene extends Phaser.Scene {
  constructor() {
    super('GravityToggleScene');
    // 状态信号变量
    this.gravityDirection = 'DOWN'; // 可验证的状态：'DOWN' 或 'UP'
    this.toggleCount = 0; // 切换次数计数
  }

  preload() {
    // 使用 Graphics 创建玩家纹理，无需外部资源
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制一个蓝色圆形作为玩家
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(16, 16, 16);
    
    // 添加方向指示器（小三角形）
    graphics.fillStyle(0xffff00, 1);
    graphics.fillTriangle(16, 4, 12, 12, 20, 12);
    
    graphics.generateTexture('player', 32, 32);
    graphics.destroy();
  }

  create() {
    const { width, height } = this.cameras.main;

    // 创建玩家精灵，位于屏幕中央
    this.player = this.physics.add.sprite(width / 2, height / 2, 'player');
    this.player.setCollideWorldBounds(true); // 防止玩家飞出屏幕
    this.player.setBounce(0.3); // 添加一点弹性

    // 设置初始重力方向为向下
    this.physics.world.gravity.y = 400;
    this.physics.world.gravity.x = 0;

    // 创建文本显示当前重力方向
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.gravityText.setDepth(100);

    // 创建切换次数显示
    this.toggleText = this.add.text(16, 50, 'Toggles: 0', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.toggleText.setDepth(100);

    // 创建说明文本
    this.instructionText = this.add.text(width / 2, height - 30, 'Press SPACE to toggle gravity', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5, 0.5);
    this.instructionText.setDepth(100);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    // 防止按住空格连续触发，使用 justDown 检测
    this.lastToggleTime = 0;
  }

  update(time, delta) {
    // 检测空格键按下（带防抖，200ms内只能触发一次）
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey) && time - this.lastToggleTime > 200) {
      this.toggleGravity();
      this.lastToggleTime = time;
    }

    // 根据重力方向旋转玩家精灵（视觉反馈）
    if (this.gravityDirection === 'DOWN') {
      this.player.setAngle(0);
    } else {
      this.player.setAngle(180);
    }

    // 更新文本显示
    this.gravityText.setText(`Gravity: ${this.gravityDirection}`);
    this.toggleText.setText(`Toggles: ${this.toggleCount}`);

    // 添加位置信息用于调试
    const playerY = Math.round(this.player.y);
    const velocityY = Math.round(this.player.body.velocity.y);
    
    // 可选：显示详细调试信息
    if (!this.debugText) {
      this.debugText = this.add.text(16, 84, '', {
        fontSize: '14px',
        fontFamily: 'Arial',
        color: '#aaaaaa',
        backgroundColor: '#000000',
        padding: { x: 10, y: 5 }
      });
      this.debugText.setDepth(100);
    }
    this.debugText.setText(`Y: ${playerY} | Velocity: ${velocityY}`);
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      // 切换到向上
      this.physics.world.gravity.y = -400;
      this.gravityDirection = 'UP';
    } else {
      // 切换到向下
      this.physics.world.gravity.y = 400;
      this.gravityDirection = 'DOWN';
    }

    // 增加切换计数
    this.toggleCount++;

    // 在切换时给玩家一个小的初始速度，使效果更明显
    if (this.gravityDirection === 'UP') {
      this.player.setVelocityY(-100);
    } else {
      this.player.setVelocityY(100);
    }

    // 视觉反馈：闪烁效果
    this.cameras.main.flash(100, 255, 255, 255, false);
  }
}

// Phaser Game 配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 400 }, // 初始重力向下
      debug: false // 设为 true 可查看物理边界
    }
  },
  scene: GravityToggleScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于验证（可选）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const scene = game.scene.scenes[0];
    return {
      gravityDirection: scene.gravityDirection,
      toggleCount: scene.toggleCount,
      playerY: scene.player ? Math.round(scene.player.y) : 0,
      gravityValue: scene.physics.world.gravity.y
    };
  };
}