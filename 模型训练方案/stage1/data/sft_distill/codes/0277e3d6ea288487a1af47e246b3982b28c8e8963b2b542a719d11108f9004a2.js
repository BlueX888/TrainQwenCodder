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

let hexagon;
let keys;
const SPEED = 360; // 像素/秒

function preload() {
  // 无需预加载外部资源
}

function create() {
  // 创建六边形纹理
  createHexagonTexture(this);
  
  // 创建六边形精灵并放置在屏幕中心
  hexagon = this.add.sprite(400, 300, 'hexagon');
  
  // 设置 WASD 键盘输入
  keys = this.input.keyboard.addKeys({
    w: Phaser.Input.Keyboard.KeyCodes.W,
    a: Phaser.Input.Keyboard.KeyCodes.A,
    s: Phaser.Input.Keyboard.KeyCodes.S,
    d: Phaser.Input.Keyboard.KeyCodes.D
  });
}

function update(time, delta) {
  // 计算本帧移动距离（速度 * 时间）
  const distance = SPEED * (delta / 1000);
  
  // 重置速度
  let velocityX = 0;
  let velocityY = 0;
  
  // 根据按键状态设置速度方向
  if (keys.w.isDown) {
    velocityY = -1;
  }
  if (keys.s.isDown) {
    velocityY = 1;
  }
  if (keys.a.isDown) {
    velocityX = -1;
  }
  if (keys.d.isDown) {
    velocityX = 1;
  }
  
  // 归一化对角线移动速度（避免对角线移动更快）
  if (velocityX !== 0 && velocityY !== 0) {
    const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    velocityX /= length;
    velocityY /= length;
  }
  
  // 更新六边形位置
  hexagon.x += velocityX * distance;
  hexagon.y += velocityY * distance;
  
  // 边界限制（可选，防止六边形移出屏幕）
  hexagon.x = Phaser.Math.Clamp(hexagon.x, 0, 800);
  hexagon.y = Phaser.Math.Clamp(hexagon.y, 0, 600);
}

/**
 * 创建六边形纹理
 */
function createHexagonTexture(scene) {
  const graphics = scene.add.graphics();
  
  // 六边形参数
  const radius = 40;
  const hexPoints = [];
  
  // 计算六边形的六个顶点（从顶部开始，顺时针）
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2; // -90度起始，使顶点朝上
    const x = radius + radius * Math.cos(angle);
    const y = radius + radius * Math.sin(angle);
    hexPoints.push(x, y);
  }
  
  // 绘制六边形
  graphics.fillStyle(0x00ff88, 1);
  graphics.fillPolygon(hexPoints);
  
  // 添加边框
  graphics.lineStyle(3, 0xffffff, 1);
  graphics.strokePolygon(hexPoints);
  
  // 生成纹理
  graphics.generateTexture('hexagon', radius * 2, radius * 2);
  
  // 销毁 graphics 对象（纹理已生成）
  graphics.destroy();
}

new Phaser.Game(config);