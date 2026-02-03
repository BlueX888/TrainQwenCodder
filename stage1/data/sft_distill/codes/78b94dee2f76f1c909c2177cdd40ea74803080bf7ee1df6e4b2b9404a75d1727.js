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
  // 无需预加载资源
}

function create() {
  // 记录已生成的菱形数量
  this.diamondCount = 0;
  const maxDiamonds = 3;
  
  // 菱形尺寸
  const diamondSize = 40;
  
  // 创建定时器事件，每3秒执行一次
  this.time.addEvent({
    delay: 3000, // 3秒
    callback: () => {
      // 检查是否已达到最大数量
      if (this.diamondCount < maxDiamonds) {
        // 生成随机位置（确保菱形完全在画布内）
        const x = Phaser.Math.Between(diamondSize, config.width - diamondSize);
        const y = Phaser.Math.Between(diamondSize, config.height - diamondSize);
        
        // 创建菱形
        createDiamond.call(this, x, y, diamondSize);
        
        // 增加计数
        this.diamondCount++;
        
        console.log(`生成第 ${this.diamondCount} 个菱形，位置: (${x}, ${y})`);
      } else {
        console.log('已达到最大数量限制（3个）');
      }
    },
    callbackScope: this,
    loop: true // 循环执行
  });
  
  // 添加提示文本
  this.add.text(10, 10, '每3秒生成一个灰色菱形\n最多生成3个', {
    fontSize: '18px',
    color: '#ffffff',
    backgroundColor: '#000000',
    padding: { x: 10, y: 5 }
  });
}

/**
 * 创建灰色菱形
 * @param {number} x - 中心X坐标
 * @param {number} y - 中心Y坐标
 * @param {number} size - 菱形尺寸
 */
function createDiamond(x, y, size) {
  const graphics = this.add.graphics();
  
  // 设置灰色填充
  graphics.fillStyle(0x808080, 1);
  
  // 定义菱形的四个顶点（相对于中心点）
  const points = [
    { x: 0, y: -size },      // 上顶点
    { x: size, y: 0 },       // 右顶点
    { x: 0, y: size },       // 下顶点
    { x: -size, y: 0 }       // 左顶点
  ];
  
  // 将相对坐标转换为绝对坐标
  const absolutePoints = points.map(p => ({ x: x + p.x, y: y + p.y }));
  
  // 绘制填充的多边形
  graphics.fillPoints(absolutePoints, true);
  
  // 添加白色边框使菱形更明显
  graphics.lineStyle(2, 0xffffff, 1);
  graphics.strokePoints(absolutePoints, true);
}

new Phaser.Game(config);