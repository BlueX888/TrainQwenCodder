// 完整的 Phaser3 点击计数器游戏
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

// 计数器变量
let counter = 0;
let counterText = null;

function preload() {
  // 本示例不需要预加载外部资源
}

function create() {
  // 创建计数器文本显示，位置在左上角
  counterText = this.add.text(20, 20, 'Count: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: {
      x: 10,
      y: 5
    }
  });

  // 添加点击提示文本
  const hintText = this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#cccccc'
  });
  hintText.setOrigin(0.5);

  // 监听整个场景的点击事件
  this.input.on(Phaser.Input.Events.POINTER_DOWN, () => {
    // 计数器递增
    counter++;
    
    // 更新文本显示
    counterText.setText('Count: ' + counter);
    
    // 添加点击反馈效果：文本缩放动画
    this.tweens.add({
      targets: counterText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power1'
    });
    
    // 在点击位置创建一个圆形反馈效果
    const clickFeedback = this.add.circle(
      this.input.activePointer.x,
      this.input.activePointer.y,
      20,
      0x00ff00,
      0.6
    );
    
    // 让圆形淡出并销毁
    this.tweens.add({
      targets: clickFeedback,
      alpha: 0,
      scale: 2,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        clickFeedback.destroy();
      }
    });
  });
}

// 启动游戏
new Phaser.Game(config);