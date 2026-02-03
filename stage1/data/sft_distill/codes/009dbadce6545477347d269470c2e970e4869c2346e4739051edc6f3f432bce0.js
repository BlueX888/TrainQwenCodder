const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload,
    create,
    update
  }
};

// 全局验证信号
window.__signals__ = {
  objectCount: 0,
  sortCount: 0,
  currentOrder: [],
  lastDraggedIndex: -1
};

let objects = [];
let isDragging = false;

function preload() {
  // 创建黄色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFFD700, 1);
  graphics.fillRoundedRect(0, 0, 60, 40, 8);
  graphics.lineStyle(2, 0xFFA500, 1);
  graphics.strokeRoundedRect(0, 0, 60, 40, 8);
  graphics.generateTexture('yellowBox', 60, 40);
  graphics.destroy();
}

function create() {
  // 添加标题文本
  this.add.text(400, 30, '拖拽黄色方块，松手后自动按Y坐标排序', {
    fontSize: '20px',
    color: '#ffffff',
    fontStyle: 'bold'
  }).setOrigin(0.5);

  // 创建20个黄色物体
  const startX = 100;
  const startY = 80;
  const spacing = 45;
  const columns = 5;

  for (let i = 0; i < 20; i++) {
    const row = Math.floor(i / columns);
    const col = i % columns;
    const x = startX + col * 140;
    const y = startY + row * 120;

    // 创建物体
    const obj = this.add.image(x, y, 'yellowBox');
    obj.setInteractive({ draggable: true });
    obj.setData('index', i);
    obj.setData('originalDepth', i);

    // 添加编号文本
    const text = this.add.text(x, y, `#${i + 1}`, {
      fontSize: '16px',
      color: '#000000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    obj.setData('text', text);
    objects.push(obj);
  }

  window.__signals__.objectCount = objects.length;
  updateOrderSignal();

  // 拖拽开始事件
  this.input.on('dragstart', (pointer, gameObject) => {
    isDragging = true;
    gameObject.setDepth(1000);
    gameObject.setScale(1.1);
    gameObject.setTint(0xFFFF00);
    
    const text = gameObject.getData('text');
    text.setDepth(1001);
    text.setScale(1.1);

    window.__signals__.lastDraggedIndex = gameObject.getData('index');
    console.log(JSON.stringify({
      event: 'drag_start',
      index: gameObject.getData('index'),
      position: { x: gameObject.x, y: gameObject.y }
    }));
  });

  // 拖拽中事件
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;

    const text = gameObject.getData('text');
    text.x = dragX;
    text.y = dragY;
  });

  // 拖拽结束事件
  this.input.on('dragend', (pointer, gameObject) => {
    isDragging = false;
    gameObject.clearTint();
    gameObject.setScale(1);

    const text = gameObject.getData('text');
    text.setScale(1);

    console.log(JSON.stringify({
      event: 'drag_end',
      index: gameObject.getData('index'),
      position: { x: gameObject.x, y: gameObject.y }
    }));

    // 按Y坐标排序并重新排列
    sortAndArrangeObjects(this);
  });
}

function sortAndArrangeObjects(scene) {
  // 按Y坐标排序
  const sortedObjects = [...objects].sort((a, b) => a.y - b.y);

  window.__signals__.sortCount++;

  // 计算新的排列位置
  const startX = 100;
  const startY = 80;
  const spacing = 45;
  const columns = 5;

  sortedObjects.forEach((obj, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const targetX = startX + col * 140;
    const targetY = startY + row * 120;

    const text = obj.getData('text');

    // 使用缓动动画移动到新位置
    scene.tweens.add({
      targets: obj,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        obj.setDepth(index);
      }
    });

    scene.tweens.add({
      targets: text,
      x: targetX,
      y: targetY,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        text.setDepth(index + 1);
      }
    });
  });

  updateOrderSignal();

  console.log(JSON.stringify({
    event: 'sort_complete',
    sortCount: window.__signals__.sortCount,
    newOrder: window.__signals__.currentOrder
  }));
}

function updateOrderSignal() {
  // 按Y坐标排序后记录当前顺序
  const sortedByY = [...objects].sort((a, b) => a.y - b.y);
  window.__signals__.currentOrder = sortedByY.map(obj => obj.getData('index'));
}

function update(time, delta) {
  // 实时更新顺序（仅在非拖拽状态）
  if (!isDragging) {
    updateOrderSignal();
  }
}

new Phaser.Game(config);