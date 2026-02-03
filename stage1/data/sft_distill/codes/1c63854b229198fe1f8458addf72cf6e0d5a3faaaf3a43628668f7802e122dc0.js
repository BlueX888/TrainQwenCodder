const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let fadeStatus = 'starting';
let statusText;
let fadeInComplete = false;
let fadeOutComplete = false;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建背景图形
  const graphics = this.add.graphics();
  
  // 绘制彩色方块作为场景内容
  graphics.fillStyle(0xff6b6b, 1);
  graphics.fillRect(100, 150, 150, 150);
  
  graphics.fillStyle(0x4ecdc4, 1);
  graphics.fillCircle(400, 225, 75);
  
  graphics.fillStyle(0xffe66d, 1);
  graphics.fillRect(550, 150, 150, 150);
  
  // 添加标题文本
  const titleText = this.add.text(400, 80, 'Fade In/Out Demo', {
    fontSize: '48px',
    fontFamily: 'Arial',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 添加状态显示文本
  statusText = this.add.text(400, 400, 'Status: Starting...', {
    fontSize: '24px',
    fontFamily: 'Arial',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 20, y: 10 }
  });
  statusText.setOrigin(0.5);
  
  // 添加说明文本
  const infoText = this.add.text(400, 500, 'Watch the fade in (2.5s) → fade out (2.5s) effect', {
    fontSize: '18px',
    fontFamily: 'Arial',
    color: '#aaaaaa'
  });
  infoText.setOrigin(0.5);
  
  // 获取主摄像机
  const camera = this.cameras.main;
  
  // 开始淡入效果（持续2.5秒，从黑色淡入）
  fadeStatus = 'fading_in';
  statusText.setText('Status: Fading In... (2.5s)');
  
  camera.fadeIn(2500, 0, 0, 0);
  
  // 监听淡入完成事件
  camera.once('camerafadeincomplete', () => {
    fadeStatus = 'fade_in_complete';
    fadeInComplete = true;
    statusText.setText('Status: Fade In Complete!');
    
    console.log('Fade in completed at:', Date.now());
    
    // 等待1秒后开始淡出
    this.time.delayedCall(1000, () => {
      fadeStatus = 'fading_out';
      statusText.setText('Status: Fading Out... (2.5s)');
      
      // 开始淡出效果（持续2.5秒，淡出到黑色）
      camera.fadeOut(2500, 0, 0, 0);
    });
  });
  
  // 监听淡出完成事件
  camera.once('camerafadeoutcomplete', () => {
    fadeStatus = 'fade_out_complete';
    fadeOutComplete = true;
    statusText.setText('Status: Fade Out Complete!');
    
    console.log('Fade out completed at:', Date.now());
    
    // 可以在这里切换场景或重新开始
    this.time.delayedCall(1000, () => {
      statusText.setText('Status: Demo Complete - Restarting...');
      
      // 重新开始演示
      this.time.delayedCall(1000, () => {
        this.scene.restart();
      });
    });
  });
}

function update(time, delta) {
  // 可以在这里添加动态更新逻辑
  // 当前示例中不需要每帧更新
}

// 创建游戏实例
const game = new Phaser.Game(config);

// 导出状态变量供验证使用
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getFadeStatus: () => fadeStatus,
    isFadeInComplete: () => fadeInComplete,
    isFadeOutComplete: () => fadeOutComplete
  };
}