// 完整的 Phaser3 重力切换游戏
class GravityGameScene extends Phaser.Scene {
  constructor() {
    super('GravityGameScene');
    this.gravityDirection = 'DOWN'; // 状态信号：当前重力方向
    this.switchCount = 0; // 状态信号：切换次数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const { width, height } = this.cameras.main;

    // 1. 程序化生成玩家纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerTex', 40, 40);
    graphics.destroy();

    // 2. 创建玩家物理精灵
    this.player = this.physics.add.sprite(width / 2, height / 2, 'playerTex');
    this.player.setCollideWorldBounds(false); // 不使用内置边界，手动处理
    this.player.setBounce(0.3);

    // 3. 设置初始重力（向下 800）
    this.physics.world.gravity.y = 800;

    // 4. 创建显示文本
    this.gravityText = this.add.text(16, 16, 'Gravity: DOWN', {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    this.switchCountText = this.add.text(16, 56, 'Switches: 0', {
      fontSize: '20px',
      fill: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 5. 添加边界指示线
    const boundaryGraphics = this.add.graphics();
    boundaryGraphics.lineStyle(2, 0xff0000, 1);
    boundaryGraphics.strokeRect(0, 0, width, height);

    // 6. 监听鼠标左键点击事件
    this.input.on('pointerdown', (pointer) => {
      if (pointer.leftButtonDown()) {
        this.toggleGravity();
      }
    });

    // 7. 添加键盘空格键作为备用切换方式
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 8. 添加说明文本
    this.add.text(width / 2, height - 30, 'Click Left Mouse or Press SPACE to Toggle Gravity', {
      fontSize: '18px',
      fill: '#cccccc'
    }).setOrigin(0.5);
  }

  update(time, delta) {
    const { width, height } = this.cameras.main;

    // 检测空格键按下
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      this.toggleGravity();
    }

    // 边界检测和位置重置
    if (this.gravityDirection === 'DOWN') {
      // 重力向下时，检测是否触碰底部
      if (this.player.y > height - 20) {
        this.resetPlayerPosition();
      }
    } else {
      // 重力向上时，检测是否触碰顶部
      if (this.player.y < 20) {
        this.resetPlayerPosition();
      }
    }

    // 防止玩家完全离开屏幕（左右边界）
    if (this.player.x < -50) {
      this.player.x = width + 50;
    } else if (this.player.x > width + 50) {
      this.player.x = -50;
    }
  }

  toggleGravity() {
    // 切换重力方向
    if (this.gravityDirection === 'DOWN') {
      this.physics.world.gravity.y = -800;
      this.gravityDirection = 'UP';
      this.gravityText.setText('Gravity: UP');
      this.gravityText.setStyle({ fill: '#00ffff' });
    } else {
      this.physics.world.gravity.y = 800;
      this.gravityDirection = 'DOWN';
      this.gravityText.setText('Gravity: DOWN');
      this.gravityText.setStyle({ fill: '#ffffff' });
    }

    // 更新切换次数
    this.switchCount++;
    this.switchCountText.setText(`Switches: ${this.switchCount}`);

    // 给玩家一个小的初始速度，使效果更明显
    if (this.gravityDirection === 'UP') {
      this.player.setVelocityY(-200);
    } else {
      this.player.setVelocityY(200);
    }
  }

  resetPlayerPosition() {
    const { width, height } = this.cameras.main;
    
    // 根据重力方向重置到相反侧
    if (this.gravityDirection === 'DOWN') {
      this.player.setPosition(width / 2, 50);
    } else {
      this.player.setPosition(width / 2, height - 50);
    }
    
    // 重置速度
    this.player.setVelocity(0, 0);
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
      gravity: { y: 800 }, // 初始重力向下
      debug: false
    }
  },
  scene: GravityGameScene
};

// 启动游戏
const game = new Phaser.Game(config);