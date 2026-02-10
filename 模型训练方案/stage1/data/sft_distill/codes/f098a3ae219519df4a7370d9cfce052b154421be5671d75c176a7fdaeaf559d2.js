const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

let triangle;
let pointer;
const FOLLOW_SPEED = 160; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1); // 黄色
  
  // 绘制一个朝右的三角形（顶点在右侧）
  graphics.beginPath();
  graphics.moveTo(20, 0);    // 右顶点
  graphics.lineTo(-10, -10); // 左上顶点
  graphics.lineTo(-10, 10);  // 左下顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 20);
  graphics.destroy();
  
  // 创建三角形精灵，初始位置在屏幕中心
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse - Triangle follows!', {
    fontSize: '18px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算三角形到鼠标的距离
  const distance = Phaser.Math.Distance.Between(
    triangle.x,
    triangle.y,
    pointer.x,
    pointer.y
  );
  
  // 只有当距离大于一定阈值时才移动，避免抖动
  if (distance > 2) {
    // 计算三角形到鼠标的角度
    const angle = Phaser.Math.Angle.Between(
      triangle.x,
      triangle.y,
      pointer.x,
      pointer.y
    );
    
    // 根据速度和时间计算本帧应移动的距离
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果移动距离大于实际距离，直接到达目标点
    if (moveDistance >= distance) {
      triangle.x = pointer.x;
      triangle.y = pointer.y;
    } else {
      // 根据角度和移动距离计算新位置
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    }
    
    // 旋转三角形使其朝向鼠标方向
    triangle.rotation = angle;
  }
}

new Phaser.Game(config);