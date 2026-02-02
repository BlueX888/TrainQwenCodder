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
  // 菱形计数器
  let diamondCount = 0;
  const maxDiamonds = 12;
  
  // 添加标题文字
  this.add.text(400, 30, '紫色菱形生成器', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数显示
  const countText = this.add.text(400, 70, `已生成: ${diamondCount}/${maxDiamonds}`, {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 创建菱形的函数
  const createDiamond = () => {
    if (diamondCount >= maxDiamonds) {
      return;
    }
    
    // 生成随机位置（留出边距避免菱形被裁切）
    const margin = 40;
    const x = Phaser.Math.Between(margin, 800 - margin);
    const y = Phaser.Math.Between(100 + margin, 600 - margin);
    
    // 创建菱形图形
    const graphics = this.add.graphics();
    
    // 设置紫色填充
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    
    // 绘制菱形（使用beginPath和lineTo）
    const size = 30; // 菱形大小
    graphics.beginPath();
    graphics.moveTo(x, y - size);        // 上顶点
    graphics.lineTo(x + size, y);        // 右顶点
    graphics.lineTo(x, y + size);        // 下顶点
    graphics.lineTo(x - size, y);        // 左顶点
    graphics.closePath();
    graphics.fillPath();
    
    // 添加描边
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokePath();
    
    // 增加计数
    diamondCount++;
    countText.setText(`已生成: ${diamondCount}/${maxDiamonds}`);
    
    // 添加简单的缩放动画
    graphics.setScale(0);
    this.tweens.add({
      targets: graphics,
      scale: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  };
  
  // 创建定时器事件，每2.5秒执行一次，重复12次
  this.time.addEvent({
    delay: 2500,           // 2.5秒 = 2500毫秒
    callback: createDiamond,
    callbackScope: this,
    repeat: maxDiamonds - 1,  // 重复11次，加上首次执行共12次
    loop: false
  });
  
  // 立即生成第一个菱形（可选，如果想从0秒开始）
  // 如果不想立即生成，可以注释掉下面这行
  // createDiamond.call(this);
}

new Phaser.Game(config);