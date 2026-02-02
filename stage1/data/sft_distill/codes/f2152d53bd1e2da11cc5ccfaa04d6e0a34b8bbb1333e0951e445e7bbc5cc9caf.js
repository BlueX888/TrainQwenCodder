// 完整的 Phaser3 计数器游戏代码
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
  // 创建计数器文本显示，位于左上角
  counterText = this.add.text(20, 20, 'Count: 0', {
    fontSize: '32px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: {
      left: 10,
      right: 10,
      top: 5,
      bottom: 5
    }
  });

  // 设置文本固定到相机（滚动时不移动）
  counterText.setScrollFactor(0);

  // 添加提示文本
  const hintText = this.add.text(400, 300, 'Click anywhere to count!', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  hintText.setOrigin(0.5);

  // 监听画面点击事件
  this.input.on('pointerdown', (pointer) => {
    // 每次点击计数加1
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
      ease: 'Power2'
    });

    // 在点击位置显示 +1 效果
    const plusOne = this.add.text(pointer.x, pointer.y, '+1', {
      fontSize: '24px',
      fontFamily: 'Arial',
      color: '#00ff00',
      fontStyle: 'bold'
    });
    plusOne.setOrigin(0.5);

    // +1 文字上浮并淡出
    this.tweens.add({
      targets: plusOne,
      y: pointer.y - 50,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => {
        plusOne.destroy();
      }
    });
  });

  // 添加键盘空格键也可以计数（额外功能）
  this.input.keyboard.on('keydown-SPACE', () => {
    counter++;
    counterText.setText('Count: ' + counter);
    
    // 文本缩放动画
    this.tweens.add({
      targets: counterText,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 100,
      yoyo: true,
      ease: 'Power2'
    });
  });
}

// 启动游戏
new Phaser.Game(config);