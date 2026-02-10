class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
    this.isShaking = false; // 当前是否正在弹跳
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格，用于观察相机弹跳效果
    const graphics = this.add.graphics();
    graphics.lineStyle(2, 0x00ff00, 0.5);
    
    // 绘制网格
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 600);
    }
    for (let y = 0; y <= 600; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 绘制中心标记
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 20);

    // 绘制一些装饰方块
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(100, 100, 80, 80);
    graphics.fillRect(620, 420, 80, 80);
    
    graphics.fillStyle(0xffff00, 1);
    graphics.fillRect(600, 100, 80, 80);
    graphics.fillRect(120, 420, 80, 80);

    // 添加文字提示
    this.instructionText = this.add.text(400, 50, 'Press SPACE to shake camera', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.instructionText.setOrigin(0.5);

    // 添加状态显示文字
    this.statusText = this.add.text(400, 550, `Shake Count: ${this.shakeCount} | Status: Idle`, {
      fontSize: '20px',
      color: '#00ff00',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    this.statusText.setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    
    this.spaceKey.on('down', () => {
      this.triggerCameraShake();
    });

    // 获取主相机
    this.mainCamera = this.cameras.main;
    
    // 监听相机弹跳完成事件
    this.mainCamera.on('camerashakecomplete', () => {
      this.isShaking = false;
      this.updateStatusText();
    });
  }

  triggerCameraShake() {
    // 如果已经在弹跳中，不重复触发
    if (this.isShaking) {
      return;
    }

    // 触发相机弹跳效果
    // 参数：持续时间(ms), 强度(默认0.05), 强制模式(false), 回调, 回调上下文
    this.mainCamera.shake(3000, 0.01);
    
    // 更新状态
    this.isShaking = true;
    this.shakeCount++;
    this.updateStatusText();
  }

  updateStatusText() {
    const status = this.isShaking ? 'Shaking...' : 'Idle';
    this.statusText.setText(`Shake Count: ${this.shakeCount} | Status: ${status}`);
  }

  update(time, delta) {
    // 可以在这里添加其他更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态验证接口（用于测试）
window.getGameState = function() {
  const scene = game.scene.scenes[0];
  return {
    shakeCount: scene.shakeCount,
    isShaking: scene.isShaking
  };
};