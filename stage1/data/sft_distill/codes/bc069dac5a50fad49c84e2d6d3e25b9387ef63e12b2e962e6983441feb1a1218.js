class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录触发弹跳的次数
    this.isShaking = false; // 状态信号：当前是否正在弹跳
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，用于观察相机弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(2, 0x00ff00, 0.3);
    for (let x = 0; x < 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y < 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心参考点
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 添加一些彩色方块，增强视觉效果
    const colors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
    for (let i = 0; i < 6; i++) {
      const rect = this.add.graphics();
      rect.fillStyle(colors[i], 1);
      rect.fillRect(100 + i * 120, 150, 80, 80);
    }

    // 添加文本提示
    this.instructionText = this.add.text(400, 50, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    }).setOrigin(0.5);

    // 添加状态显示文本
    this.statusText = this.add.text(400, 500, `Shake Count: ${this.shakeCount}\nStatus: Idle`, {
      fontSize: '20px',
      color: '#ffff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 },
      align: 'center'
    }).setOrigin(0.5);

    // 添加空格键监听
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 监听空格键按下事件
    this.spaceKey.on('down', () => {
      if (!this.isShaking) {
        this.triggerCameraShake();
      }
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;

    // 监听相机弹跳完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      this.isShaking = false;
      this.updateStatusText();
      console.log('Camera shake completed');
    });
  }

  triggerCameraShake() {
    // 触发相机弹跳效果
    // 参数：持续时间(ms), 强度, 是否强制, 回调函数, 上下文
    this.mainCamera.shake(3000, 0.01);
    
    // 更新状态
    this.isShaking = true;
    this.shakeCount++;
    this.updateStatusText();
    
    console.log(`Camera shake triggered! Count: ${this.shakeCount}`);
  }

  updateStatusText() {
    const status = this.isShaking ? 'Shaking...' : 'Idle';
    this.statusText.setText(`Shake Count: ${this.shakeCount}\nStatus: ${status}`);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 空格键的监听已通过事件处理，不需要在 update 中轮询
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证接口（用于测试）
if (typeof window !== 'undefined') {
  window.getGameState = () => {
    const scene = game.scene.scenes[0];
    return {
      shakeCount: scene.shakeCount,
      isShaking: scene.isShaking
    };
  };
}