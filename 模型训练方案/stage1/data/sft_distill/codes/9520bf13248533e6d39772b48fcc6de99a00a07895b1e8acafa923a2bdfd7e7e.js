class FlashScene extends Phaser.Scene {
  constructor() {
    super('FlashScene');
    // 状态信号变量
    this.flashCount = 0;
    this.isFlashing = true;
    this.flashComplete = false;
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景
    const bg = this.add.graphics();
    bg.fillStyle(0x2d2d2d, 1);
    bg.fillRect(0, 0, 800, 600);

    // 创建一些可视化元素来观察闪烁效果
    const centerX = 400;
    const centerY = 300;

    // 绘制中心圆形
    const circle = this.add.graphics();
    circle.fillStyle(0x00ff00, 1);
    circle.fillCircle(centerX, centerY, 80);

    // 绘制四个角的矩形
    const corners = [
      { x: 100, y: 100, color: 0xff0000 },
      { x: 700, y: 100, color: 0x0000ff },
      { x: 100, y: 500, color: 0xffff00 },
      { x: 700, y: 500, color: 0xff00ff }
    ];

    corners.forEach(corner => {
      const rect = this.add.graphics();
      rect.fillStyle(corner.color, 1);
      rect.fillRect(corner.x - 40, corner.y - 40, 80, 80);
    });

    // 添加文本显示状态
    this.statusText = this.add.text(400, 50, 'Flashing...', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.countText = this.add.text(400, 550, 'Flash Count: 0', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 闪烁参数设置
    const flashDuration = 200; // 每次闪烁持续时间（毫秒）
    const flashInterval = 400; // 闪烁间隔（毫秒）
    const totalDuration = 3000; // 总持续时间（3秒）
    const flashTimes = Math.floor(totalDuration / flashInterval);

    // 执行闪烁效果的函数
    const performFlash = () => {
      if (this.flashCount < flashTimes && this.isFlashing) {
        // 触发相机闪烁效果（白色闪烁）
        camera.flash(flashDuration, 255, 255, 255);
        this.flashCount++;
        this.countText.setText(`Flash Count: ${this.flashCount}`);
      } else {
        // 闪烁完成
        this.isFlashing = false;
        this.flashComplete = true;
        this.statusText.setText('Flash Complete!');
        this.statusText.setColor('#00ff00');
        
        // 停止定时器
        if (this.flashTimer) {
          this.flashTimer.remove();
        }
      }
    };

    // 立即执行第一次闪烁
    performFlash();

    // 创建定时器，每隔一定时间触发一次闪烁
    this.flashTimer = this.time.addEvent({
      delay: flashInterval,
      callback: performFlash,
      callbackScope: this,
      loop: true
    });

    // 添加调试信息
    console.log('Flash effect started - will last 3 seconds');
    console.log('Expected flash count:', flashTimes);
  }

  update(time, delta) {
    // 可以在这里添加额外的更新逻辑
    // 当前示例不需要每帧更新
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: FlashScene
};

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态供验证使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { game, FlashScene };
}