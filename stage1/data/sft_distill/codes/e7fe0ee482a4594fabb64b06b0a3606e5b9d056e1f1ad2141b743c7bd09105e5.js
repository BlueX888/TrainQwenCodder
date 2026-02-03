class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.shakeCount = 0; // 状态信号：记录弹跳触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格用于观察相机弹跳效果
    const graphics = this.add.graphics();
    
    // 绘制网格背景
    graphics.lineStyle(2, 0x00ff00, 0.3);
    for (let x = 0; x < this.cameras.main.width; x += 50) {
      graphics.lineBetween(x, 0, x, this.cameras.main.height);
    }
    for (let y = 0; y < this.cameras.main.height; y += 50) {
      graphics.lineBetween(0, y, this.cameras.main.width, y);
    }

    // 绘制中心圆形作为参照物
    graphics.fillStyle(0xff0000, 1);
    graphics.fillCircle(400, 300, 50);

    // 绘制四角的矩形作为参照物
    graphics.fillStyle(0x0000ff, 1);
    graphics.fillRect(50, 50, 60, 60);
    graphics.fillRect(690, 50, 60, 60);
    graphics.fillRect(50, 490, 60, 60);
    graphics.fillRect(690, 490, 60, 60);

    // 添加提示文本
    const style = {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    };
    this.instructionText = this.add.text(
      400, 
      50, 
      'Press SPACE to shake camera', 
      style
    ).setOrigin(0.5);

    // 添加计数器文本
    this.counterText = this.add.text(
      400,
      100,
      'Shake Count: 0',
      style
    ).setOrigin(0.5);

    // 监听空格键
    this.spaceKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    // 空格键按下事件
    this.spaceKey.on('down', () => {
      // 触发相机弹跳效果
      // shake(duration, intensity)
      // duration: 持续时间（毫秒）
      // intensity: 弹跳强度（默认 0.05）
      this.cameras.main.shake(1000, 0.01);
      
      // 更新状态计数
      this.shakeCount++;
      this.updateCounterText();

      // 输出日志便于验证
      console.log(`Camera shake triggered! Count: ${this.shakeCount}`);
    });

    // 监听相机弹跳完成事件
    this.cameras.main.on('camerashakecomplete', () => {
      console.log('Camera shake completed');
    });
  }

  update(time, delta) {
    // 可选：添加实时状态显示
  }

  updateCounterText() {
    this.counterText.setText(`Shake Count: ${this.shakeCount}`);
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene,
  // 可选：添加 FPS 显示
  fps: {
    target: 60,
    forceSetTimeOut: false
  }
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 暴露状态用于外部验证
window.getShakeCount = () => {
  const scene = game.scene.getScene('GameScene');
  return scene ? scene.shakeCount : 0;
};