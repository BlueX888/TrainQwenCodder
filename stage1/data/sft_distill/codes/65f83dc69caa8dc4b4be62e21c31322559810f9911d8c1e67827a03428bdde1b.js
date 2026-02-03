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

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 椭圆计数器
  let ellipseCount = 0;
  const maxEllipses = 12;
  
  // 椭圆尺寸参数
  const ellipseWidth = 60;
  const ellipseHeight = 40;
  
  // 添加标题文本
  this.add.text(10, 10, '蓝色椭圆生成器', {
    fontSize: '24px',
    color: '#ffffff'
  });
  
  // 添加计数显示
  const countText = this.add.text(10, 50, `已生成: ${ellipseCount} / ${maxEllipses}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
  
  // 创建定时器事件，每2.5秒触发一次
  this.time.addEvent({
    delay: 2500,                    // 2.5秒
    callback: generateEllipse,      // 回调函数
    callbackScope: this,            // 回调作用域
    loop: false,                    // 不循环
    repeat: maxEllipses - 1         // 重复11次（加上首次共12次）
  });
  
  // 生成椭圆的函数
  function generateEllipse() {
    // 计算随机位置（考虑椭圆尺寸，避免超出边界）
    const margin = Math.max(ellipseWidth, ellipseHeight) / 2;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(margin + 80, config.height - margin);
    
    // 使用 Graphics 绘制蓝色椭圆
    const graphics = this.add.graphics();
    graphics.fillStyle(0x0066ff, 1);  // 蓝色
    graphics.fillEllipse(randomX, randomY, ellipseWidth, ellipseHeight);
    
    // 添加轻微的边框效果
    graphics.lineStyle(2, 0x0044cc, 1);
    graphics.strokeEllipse(randomX, randomY, ellipseWidth, ellipseHeight);
    
    // 更新计数
    ellipseCount++;
    countText.setText(`已生成: ${ellipseCount} / ${maxEllipses}`);
    
    // 添加生成动画效果（可选）
    const tempCircle = this.add.circle(randomX, randomY, 5, 0xffffff, 0.8);
    this.tweens.add({
      targets: tempCircle,
      alpha: 0,
      scale: 3,
      duration: 500,
      onComplete: () => {
        tempCircle.destroy();
      }
    });
  }
}

// 创建游戏实例
new Phaser.Game(config);