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

let diamondCount = 0;
const MAX_DIAMONDS = 12;

function preload() {
  // 不需要加载外部资源
}

function create() {
  // 创建一个容器来存放所有菱形
  const diamondsContainer = this.add.container(0, 0);
  
  // 添加标题文本
  const titleText = this.add.text(400, 30, '紫色菱形生成器', {
    fontSize: '24px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  titleText.setOrigin(0.5);
  
  // 添加计数器文本
  const countText = this.add.text(400, 60, `已生成: ${diamondCount} / ${MAX_DIAMONDS}`, {
    fontSize: '18px',
    color: '#ffffff'
  });
  countText.setOrigin(0.5);
  
  // 创建菱形的函数
  const createDiamond = () => {
    if (diamondCount >= MAX_DIAMONDS) {
      timerEvent.remove();
      return;
    }
    
    // 生成随机位置（留出边距）
    const x = Phaser.Math.Between(50, 750);
    const y = Phaser.Math.Between(100, 550);
    
    // 创建菱形图形
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9d4edd, 1); // 紫色
    graphics.lineStyle(2, 0xffffff, 1); // 白色边框
    
    // 绘制菱形（四个顶点）
    const size = 30;
    graphics.beginPath();
    graphics.moveTo(x, y - size); // 上顶点
    graphics.lineTo(x + size, y); // 右顶点
    graphics.lineTo(x, y + size); // 下顶点
    graphics.lineTo(x - size, y); // 左顶点
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // 添加到容器
    diamondsContainer.add(graphics);
    
    // 增加计数
    diamondCount++;
    countText.setText(`已生成: ${diamondCount} / ${MAX_DIAMONDS}`);
    
    // 添加缩放动画效果
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  };
  
  // 创建定时器事件，每2.5秒触发一次
  const timerEvent = this.time.addEvent({
    delay: 2500, // 2.5秒 = 2500毫秒
    callback: createDiamond,
    callbackScope: this,
    loop: true
  });
  
  // 立即生成第一个菱形
  createDiamond();
}

new Phaser.Game(config);