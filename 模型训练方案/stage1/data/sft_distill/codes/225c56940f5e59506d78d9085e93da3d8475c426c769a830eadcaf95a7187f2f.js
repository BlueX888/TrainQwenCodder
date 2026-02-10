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

// 状态信号变量
let sortCount = 0; // 记录排序次数
let currentOrder = []; // 当前物体顺序

function preload() {
  // 创建紫色矩形纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0x9b59b6, 1);
  graphics.fillRoundedRect(0, 0, 100, 80, 10);
  graphics.generateTexture('purpleBox', 100, 80);
  graphics.destroy();
}

function create() {
  // 标题文本
  this.add.text(400, 30, '拖拽紫色物体进行排序', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);

  // 状态显示
  const statusText = this.add.text(400, 560, `排序次数: ${sortCount}`, {
    fontSize: '18px',
    color: '#00ff00'
  }).setOrigin(0.5);

  // 创建5个紫色物体
  const boxes = [];
  const startX = 150;
  const startY = 150;
  const spacing = 80;

  for (let i = 0; i < 5; i++) {
    const box = this.add.sprite(startX, startY + i * spacing, 'purpleBox');
    box.setInteractive({ draggable: true });
    box.setData('index', i); // 保存初始索引
    
    // 添加编号文本
    const label = this.add.text(box.x, box.y, `#${i + 1}`, {
      fontSize: '32px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);
    
    box.setData('label', label);
    boxes.push(box);
    currentOrder.push(i);
  }

  // 拖拽开始
  this.input.on('dragstart', (pointer, gameObject) => {
    gameObject.setTint(0xffff00); // 高亮显示
    gameObject.setDepth(1); // 置于顶层
    const label = gameObject.getData('label');
    label.setDepth(2);
  });

  // 拖拽中
  this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
    gameObject.x = dragX;
    gameObject.y = dragY;
    
    // 标签跟随
    const label = gameObject.getData('label');
    label.x = dragX;
    label.y = dragY;
  });

  // 拖拽结束
  this.input.on('dragend', (pointer, gameObject) => {
    gameObject.clearTint();
    gameObject.setDepth(0);
    const label = gameObject.getData('label');
    label.setDepth(1);
    
    // 收集所有物体的Y坐标和索引
    const positions = boxes.map((box, idx) => ({
      box: box,
      y: box.y,
      originalIndex: idx
    }));

    // 按Y坐标排序
    positions.sort((a, b) => a.y - b.y);

    // 更新当前顺序
    currentOrder = positions.map(p => p.box.getData('index'));
    sortCount++;
    statusText.setText(`排序次数: ${sortCount} | 当前顺序: [${currentOrder.join(', ')}]`);

    // 计算新的Y位置并使用Tween动画移动
    positions.forEach((item, index) => {
      const targetY = startY + index * spacing;
      const targetX = startX;

      // 物体动画
      this.tweens.add({
        targets: item.box,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });

      // 标签动画
      const itemLabel = item.box.getData('label');
      this.tweens.add({
        targets: itemLabel,
        x: targetX,
        y: targetY,
        duration: 300,
        ease: 'Power2'
      });
    });

    console.log('排序完成:', {
      sortCount: sortCount,
      order: currentOrder,
      positions: positions.map(p => ({ index: p.box.getData('index'), y: p.y }))
    });
  });

  // 添加说明文本
  this.add.text(500, 150, '拖拽物体改变位置\n松手后自动排序\n\n排序规则：\n按Y坐标从小到大\n自动对齐到网格', {
    fontSize: '16px',
    color: '#cccccc',
    lineSpacing: 8
  });

  // 添加重置按钮
  const resetButton = this.add.text(650, 450, '重置', {
    fontSize: '20px',
    color: '#ffffff',
    backgroundColor: '#e74c3c',
    padding: { x: 20, y: 10 }
  }).setInteractive();

  resetButton.on('pointerdown', () => {
    // 重置所有物体到初始位置
    boxes.forEach((box, index) => {
      this.tweens.add({
        targets: box,
        x: startX,
        y: startY + index * spacing,
        duration: 400,
        ease: 'Back.easeOut'
      });

      const label = box.getData('label');
      this.tweens.add({
        targets: label,
        x: startX,
        y: startY + index * spacing,
        duration: 400,
        ease: 'Back.easeOut'
      });
    });

    sortCount = 0;
    currentOrder = [0, 1, 2, 3, 4];
    statusText.setText(`排序次数: ${sortCount}`);
  });

  resetButton.on('pointerover', () => {
    resetButton.setStyle({ backgroundColor: '#c0392b' });
  });

  resetButton.on('pointerout', () => {
    resetButton.setStyle({ backgroundColor: '#e74c3c' });
  });
}

new Phaser.Game(config);