const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#000000',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

// 状态变量
let currentParticleType = 0; // 当前粒子类型索引 (0=红色, 1=绿色, 2=蓝色)
let particleEmitter = null;
let particleTextures = [];
let statusText = null;

// 粒子配置数组
const particleConfigs = [
  {
    name: 'Red Particles',
    color: 0xff0000,
    speed: { min: 100, max: 200 },
    scale: { start: 1, end: 0 },
    lifespan: 2000,
    frequency: 50,
    quantity: 2
  },
  {
    name: 'Green Particles',
    color: 0x00ff00,
    speed: { min: 150, max: 300 },
    scale: { start: 0.5, end: 1.5 },
    lifespan: 1500,
    frequency: 30,
    quantity: 3
  },
  {
    name: 'Blue Particles',
    color: 0x0099ff,
    speed: { min: 50, max: 150 },
    scale: { start: 1.5, end: 0.2 },
    lifespan: 3000,
    frequency: 80,
    quantity: 1
  }
];

function preload() {
  // 预加载阶段（本例使用 Graphics 生成纹理，无需预加载外部资源）
}

function create() {
  // 创建3种颜色的粒子纹理
  particleTextures = createParticleTextures(this);
  
  // 创建粒子发射器（初始使用第一种类型）
  particleEmitter = this.add.particles(400, 300, particleTextures[0], {
    speed: particleConfigs[0].speed,
    scale: particleConfigs[0].scale,
    lifespan: particleConfigs[0].lifespan,
    frequency: particleConfigs[0].frequency,
    quantity: particleConfigs[0].quantity,
    blendMode: 'ADD',
    angle: { min: 0, max: 360 }
  });
  
  // 创建状态显示文本
  statusText = this.add.text(10, 10, '', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#00000088',
    padding: { x: 10, y: 5 }
  });
  updateStatusText();
  
  // 添加提示文本
  this.add.text(400, 550, 'Click Left Mouse Button to Switch Particle Type', {
    fontSize: '18px',
    color: '#ffff00'
  }).setOrigin(0.5);
  
  // 监听鼠标左键点击事件
  this.input.on('pointerdown', (pointer) => {
    if (pointer.leftButtonDown()) {
      switchParticleType(this);
    }
  });
  
  // 让粒子发射器跟随鼠标
  this.input.on('pointermove', (pointer) => {
    particleEmitter.setPosition(pointer.x, pointer.y);
  });
}

function update(time, delta) {
  // 每帧更新逻辑（本例中粒子系统自动更新）
}

/**
 * 创建3种颜色的粒子纹理
 */
function createParticleTextures(scene) {
  const textures = [];
  const colors = [0xff0000, 0x00ff00, 0x0099ff]; // 红、绿、蓝
  
  colors.forEach((color, index) => {
    const graphics = scene.add.graphics();
    
    // 绘制圆形粒子
    graphics.fillStyle(color, 1);
    graphics.fillCircle(8, 8, 8);
    
    // 添加外发光效果
    graphics.fillStyle(color, 0.5);
    graphics.fillCircle(8, 8, 12);
    
    // 生成纹理
    const textureName = `particle_${index}`;
    graphics.generateTexture(textureName, 16, 16);
    graphics.destroy();
    
    textures.push(textureName);
  });
  
  return textures;
}

/**
 * 切换粒子类型
 */
function switchParticleType(scene) {
  // 切换到下一个粒子类型
  currentParticleType = (currentParticleType + 1) % particleConfigs.length;
  
  const config = particleConfigs[currentParticleType];
  
  // 更新粒子发射器配置
  particleEmitter.setTexture(particleTextures[currentParticleType]);
  particleEmitter.setSpeed(config.speed);
  particleEmitter.setScale(config.scale);
  particleEmitter.setLifespan(config.lifespan);
  particleEmitter.setFrequency(config.frequency);
  particleEmitter.setQuantity(config.quantity);
  
  // 更新状态文本
  updateStatusText();
  
  // 添加视觉反馈（屏幕闪烁效果）
  scene.cameras.main.flash(200, 
    config.color >> 16 & 0xff, 
    config.color >> 8 & 0xff, 
    config.color & 0xff
  );
}

/**
 * 更新状态显示文本
 */
function updateStatusText() {
  const config = particleConfigs[currentParticleType];
  const colorName = ['Red', 'Green', 'Blue'][currentParticleType];
  
  statusText.setText([
    `Current Particle Type: ${currentParticleType}`,
    `Name: ${config.name}`,
    `Color: ${colorName}`,
    `Lifespan: ${config.lifespan}ms`,
    `Frequency: ${config.frequency}ms`,
    `Quantity: ${config.quantity}`
  ]);
}

// 启动游戏
new Phaser.Game(config);