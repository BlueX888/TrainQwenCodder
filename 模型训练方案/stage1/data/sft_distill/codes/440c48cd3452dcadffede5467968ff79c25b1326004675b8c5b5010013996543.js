const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 状态信号：记录排序次数
let sortCount = 0;
let objects = [];

function preload() {
  // 创建紫色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1);
  graphics.fillRect(0, 0, 120, 80);
  graphics.generateTexture('purpleBox', 120, 80);
  graphics.destroy();
}

function create() {
  // 创建标题文本
  this.add.text(400, 30, '拖拽紫色物体进行排序', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建排序次数显示
  this.sortText = this.add.text(400, 70, '排序次数: 0', {
    fontSize: '18px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 创建3个紫色物体
  const startX = 200;
  const startY = 200;
  const spacing = 150;

  objects = [];

  for (let i = 0; i < 3; i++) {
    const obj = this.add.sprite(startX + i * spacing, startY + i * 50, 'purpleBox');
    
    // 添加编号文本
    const label = this.add.text(0, 0, `物体 ${i + 1}`, {
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // 创建容器以便文本跟随物体
    const container = this.add.container(obj.x, obj.y, [obj, label]);
    
    // 设置可交互和可拖拽
    container.setSize(120, 80);
    container.setInteractive({ draggable: true });
    
    // 存储原始索引
    container.setData('index', i);
    container.setData('sprite', obj);
    container.setData('label', label);
    
    objects.push(container);
  }

  // 设置拖拽事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    // 实时更新物体位置
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 提升层级，使拖拽物体在最上层
    this.children.bringToTop(gameObject);
  });

  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    // 排序所有物体按Y坐标
    sortObjects.call(this);
  });

  // 添加说明文本
  this.add.text(400, 550, '提示：拖拽物体后松手，它们会按Y坐标自动排列', {
    fontSize: '14px',
    color: '#aaaaaa'
  }).setOrigin(0.5);
}

function sortObjects() {
  // 按Y坐标排序
  const sorted = [...objects].sort((a, b) => a.y - b.y);
  
  // 计算新的Y位置（等间距排列）
  const startY = 200;
  const spacing = 120;
  const fixedX = 400;
  
  // 增加排序计数
  sortCount++;
  this.sortText.setText(`排序次数: ${sortCount}`);
  
  // 使用Tween动画移动到新位置
  sorted.forEach((container, index) => {
    const targetY = startY + index * spacing;
    
    this.tweens.add({
      targets: container,
      x: fixedX,
      y: targetY,
      duration: 500,
      ease: 'Power2',
      onUpdate: () => {
        // 确保容器内的子对象相对位置正确
        const sprite = container.getData('sprite');
        const label = container.getData('label');
        sprite.x = 0;
        sprite.y = 0;
        label.x = 0;
        label.y = 0;
      }
    });
  });
  
  // 输出排序结果到控制台（用于验证）
  console.log('排序后顺序:', sorted.map(obj => `物体${obj.getData('index') + 1}`));
  console.log('排序次数:', sortCount);
}

function update(time, delta) {
  // 可选：添加鼠标悬停效果
  objects.forEach(container => {
    const sprite = container.getData('sprite');
    if (container.input && container.input.pointerOver()) {
      sprite.setTint(0xbb79d6);
    } else {
      sprite.clearTint();
    }
  });
}

new Phaser.Game(config);