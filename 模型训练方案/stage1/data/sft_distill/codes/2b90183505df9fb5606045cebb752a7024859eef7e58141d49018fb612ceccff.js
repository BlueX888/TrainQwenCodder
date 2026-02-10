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

let triangle;
let pointer;
const FOLLOW_SPEED = 160;

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 使用 Graphics 绘制黄色三角形
  const graphics = this.add.graphics();
  graphics.fillStyle(0xffff00, 1);
  
  // 绘制一个指向右侧的三角形（方便后续旋转对准鼠标）
  graphics.beginPath();
  graphics.moveTo(20, 0);      // 顶点（右）
  graphics.lineTo(-10, -10);   // 左上
  graphics.lineTo(-10, 10);    // 左下
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('triangleTex', 30, 20);
  graphics.destroy();
  
  // 创建三角形精灵
  triangle = this.add.sprite(400, 300, 'triangleTex');
  
  // 获取指针引用
  pointer = this.input.activePointer;
  
  // 添加提示文本
  this.add.text(10, 10, 'Move your mouse, the triangle will follow!', {
    fontSize: '16px',
    color: '#ffffff'
  });
}

function update(time, delta) {
  // 计算三角形到鼠标指针的距离
  const dx = pointer.x - triangle.x;
  const dy = pointer.y - triangle.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // 如果距离大于一个很小的阈值，则移动
  if (distance > 1) {
    // 计算角度（弧度）
    const angle = Math.atan2(dy, dx);
    
    // 旋转三角形朝向鼠标
    triangle.rotation = angle;
    
    // 计算本帧移动的距离（速度 * 时间，delta单位是毫秒）
    const moveDistance = FOLLOW_SPEED * (delta / 1000);
    
    // 如果剩余距离小于本帧移动距离，直接到达目标点
    if (distance < moveDistance) {
      triangle.x = pointer.x;
      triangle.y = pointer.y;
    } else {
      // 否则按速度移动
      triangle.x += Math.cos(angle) * moveDistance;
      triangle.y += Math.sin(angle) * moveDistance;
    }
  }
}

new Phaser.Game(config);