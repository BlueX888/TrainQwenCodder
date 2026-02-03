class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.flashCount = 0; // 状态信号：记录闪烁触发次数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景和一些视觉元素
    const graphics = this.add.graphics();
    
    // 绘制渐变背景
    graphics.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x16213e, 1);
    graphics.fillRect(0, 0, 800, 600);
    
    // 绘制一些装饰圆形
    graphics.fillStyle(0x0f3460, 1);
    graphics.fillCircle(200, 150, 80);
    graphics.fillCircle(600, 400, 100);
    graphics.fillCircle(400, 300, 60);
    
    graphics.fillStyle(0x16a085, 0.8);
    graphics.fillCircle(150, 450, 50);
    graphics.fillCircle(650, 200, 70);
    
    // 添加提示文本
    const instructionText = this.add.text(400, 50, '右键点击触发相机闪烁效果', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#ffffff',
      align: 'center'
    });
    instructionText.setOrigin(0.5);
    
    // 显示闪烁计数器
    this.counterText = this.add.text(400, 100, `闪烁次数: ${this.flashCount}`, {
      fontSize: '20px',
      fontFamily: 'Arial',
      color: '#e74c3c',
      align: 'center'
    });
    this.counterText.setOrigin(0.5);
    
    // 状态指示器
    this.statusText = this.add.text(400, 550, '等待右键点击...', {
      fontSize: '18px',
      fontFamily: 'Arial',
      color: '#95a5a6',
      align: 'center'
    });
    this.statusText.setOrigin(0.5);
    
    // 监听鼠标输入事件
    this.input.on('pointerdown', (pointer) => {
      // 检查是否为右键点击 (button === 2 表示右键)
      if (pointer.rightButtonDown()) {
        this.triggerFlash();
      }
    });
    
    // 获取主相机
    this.mainCamera = this.cameras.main;
  }

  triggerFlash() {
    // 增加闪烁计数
    this.flashCount++;
    this.counterText.setText(`闪烁次数: ${this.flashCount}`);
    
    // 更新状态文本
    this.statusText.setText('闪烁中...');
    this.statusText.setColor('#e74c3c');
    
    // 触发相机闪烁效果
    // 参数：持续时间(ms), 红色强度, 绿色强度, 蓝色强度, 是否强制, 回调函数
    this.mainCamera.flash(2000, 255, 255, 255, false, (camera, progress) => {
      // 闪烁完成回调
      if (progress === 1) {
        this.statusText.setText('闪烁完成，等待右键点击...');
        this.statusText.setColor('#95a5a6');
        
        // 输出日志用于验证
        console.log(`Flash completed. Total flashes: ${this.flashCount}`);
      }
    });
    
    // 输出日志
    console.log(`Flash triggered! Count: ${this.flashCount}`);
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: GameScene,
  parent: 'game-container'
};

// 创建游戏实例
const game = new Phaser.Game(config);