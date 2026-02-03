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

// 状态变量
let animationStatus = 'running'; // 可验证的状态信号
let objectsCount = 15;
let animationCompleted = false;

function preload() {
  // 无需预加载外部资源
}

function create() {
  const scene = this;
  
  // 创建状态文本显示
  const statusText = this.add.text(400, 50, 'Animation Status: Running', {
    fontSize: '24px',
    color: '#ffffff',
    align: 'center'
  }).setOrigin(0.5);
  
  const countText = this.add.text(400, 90, `Objects: ${objectsCount}`, {
    fontSize: '20px',
    color: '#00ff00',
    align: 'center'
  }).setOrigin(0.5);
  
  // 创建15个物体的数组
  const objects = [];
  
  // 计算网格布局 (5列 x 3行)
  const cols = 5;
  const rows = 3;
  const startX = 200;
  const startY = 200;
  const spacingX = 120;
  const spacingY = 120;
  
  // 创建15个圆形物体
  for (let i = 0; i < objectsCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;
    
    // 使用Graphics绘制圆形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00aaff, 1);
    graphics.fillCircle(0, 0, 25);
    
    // 添加白色边框
    graphics.lineStyle(3, 0xffffff, 1);
    graphics.strokeCircle(0, 0, 25);
    
    // 设置位置
    graphics.setPosition(x, y);
    
    // 添加物体编号文本
    const numberText = this.add.text(x, y, (i + 1).toString(), {
      fontSize: '16px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    objects.push({ graphics, text: numberText, initialY: y });
  }
  
  // 创建同步弹跳动画
  objects.forEach((obj, index) => {
    // 为每个物体创建弹跳Tween
    scene.tweens.add({
      targets: [obj.graphics, obj.text],
      y: obj.initialY - 80, // 向上弹跳80像素
      duration: 1000, // 1秒上升
      ease: 'Sine.easeInOut',
      yoyo: true, // 自动返回
      repeat: 0, // 只执行一次完整的上下弹跳
      onComplete: function() {
        // 只在最后一个物体动画完成时更新状态
        if (index === objects.length - 1) {
          animationStatus = 'completed';
          animationCompleted = true;
          statusText.setText('Animation Status: Completed');
          statusText.setColor('#00ff00');
          
          // 添加完成提示
          scene.add.text(400, 550, 'All animations finished!', {
            fontSize: '20px',
            color: '#ffff00',
            align: 'center'
          }).setOrigin(0.5);
        }
      }
    });
  });
  
  // 添加定时器，2秒后显示时间信息
  this.time.delayedCall(2000, () => {
    const timeText = this.add.text(400, 130, 'Time elapsed: 2 seconds', {
      fontSize: '18px',
      color: '#ff9900',
      align: 'center'
    }).setOrigin(0.5);
  });
  
  // 添加说明文本
  this.add.text(400, 20, '15 Objects Synchronized Bounce Animation', {
    fontSize: '18px',
    color: '#cccccc',
    align: 'center'
  }).setOrigin(0.5);
  
  // 在控制台输出状态信息
  console.log('Animation started with', objectsCount, 'objects');
  console.log('Initial status:', animationStatus);
  
  // 2.5秒后输出最终状态
  this.time.delayedCall(2500, () => {
    console.log('Final status:', animationStatus);
    console.log('Animation completed:', animationCompleted);
  });
}

// 创建游戏实例
new Phaser.Game(config);