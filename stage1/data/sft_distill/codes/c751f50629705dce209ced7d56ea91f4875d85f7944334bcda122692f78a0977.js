class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.bounceComplete = false; // 状态信号：弹跳是否完成
    this.bounceStartTime = 0;    // 弹跳开始时间
    this.bounceEndTime = 0;      // 弹跳结束时间
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 记录弹跳开始时间
    this.bounceStartTime = this.time.now;

    // 创建背景
    const graphics = this.add.graphics();
    graphics.fillStyle(0x2d2d2d, 1);
    graphics.fillRect(0, 0, 800, 600);

    // 创建一些可视化元素来观察弹跳效果
    // 中心圆形
    const centerCircle = this.add.graphics();
    centerCircle.fillStyle(0xff6b6b, 1);
    centerCircle.fillCircle(400, 300, 80);

    // 四个角的方块
    const corners = [
      { x: 100, y: 100, color: 0x4ecdc4 },
      { x: 700, y: 100, color: 0x45b7d1 },
      { x: 100, y: 500, color: 0xf7b731 },
      { x: 700, y: 500, color: 0x5f27cd }
    ];

    corners.forEach(corner => {
      const box = this.add.graphics();
      box.fillStyle(corner.color, 1);
      box.fillRect(corner.x - 40, corner.y - 40, 80, 80);
    });

    // 添加文字提示
    const text = this.add.text(400, 50, 'Scene Bounce Effect', {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    });
    text.setOrigin(0.5);

    const statusText = this.add.text(400, 550, 'Bouncing...', {
      fontSize: '24px',
      color: '#ffff00'
    });
    statusText.setOrigin(0.5);

    // 获取主相机
    const camera = this.cameras.main;

    // 实现弹跳效果：使用zoom属性配合弹性easing
    // 方案：从1.2倍缩放弹跳回1倍（正常大小）
    camera.setZoom(1.2);

    this.tweens.add({
      targets: camera,
      zoom: 1,
      duration: 500,
      ease: 'Bounce.easeOut', // 使用弹跳缓动函数
      onComplete: () => {
        this.bounceComplete = true;
        this.bounceEndTime = this.time.now;
        statusText.setText('Bounce Complete!');
        statusText.setColor('#00ff00');
        
        console.log('Bounce effect completed');
        console.log('Duration:', this.bounceEndTime - this.bounceStartTime, 'ms');
      }
    });

    // 同时添加轻微的相机抖动效果增强弹跳感
    this.tweens.add({
      targets: camera,
      y: -10,
      duration: 250,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        camera.setPosition(0, 0); // 重置相机位置
      }
    });
  }

  update(time, delta) {
    // 可以在这里添加持续的逻辑
    // 例如显示经过的时间
    if (!this.bounceComplete) {
      const elapsed = time - this.bounceStartTime;
      // 确保弹跳效果正在进行中
    }
  }
}

// 游戏配置
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

// 导出状态供验证使用
window.getGameStatus = function() {
  const scene = game.scene.getScene('GameScene');
  return {
    bounceComplete: scene.bounceComplete,
    bounceStartTime: scene.bounceStartTime,
    bounceEndTime: scene.bounceEndTime,
    duration: scene.bounceEndTime - scene.bounceStartTime
  };
};