class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.objects = [];
    this.sortOrder = []; // 状态信号：记录当前排序顺序
    this.dragCount = 0; // 状态信号：拖拽次数
  }

  preload() {
    // 创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9b59b6, 1); // 紫色
    graphics.fillRoundedRect(0, 0, 80, 60, 8);
    graphics.lineStyle(3, 0x8e44ad, 1); // 深紫色边框
    graphics.strokeRoundedRect(0, 0, 80, 60, 8);
    graphics.generateTexture('purpleBox', 80, 60);
    graphics.destroy();
  }

  create() {
    // 添加标题文字
    this.add.text(400, 30, '拖拽紫色物体进行排序', {
      fontSize: '24px',
      color: '#ffffff',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    // 添加状态显示
    this.statusText = this.add.text(400, 60, '', {
      fontSize: '16px',
      color: '#00ff00'
    }).setOrigin(0.5);

    // 创建15个紫色物体，随机分布
    const startX = 150;
    const startY = 120;
    const spacing = 40;

    for (let i = 0; i < 15; i++) {
      // 随机初始位置
      const randomX = startX + (i % 5) * 120 + Phaser.Math.Between(-20, 20);
      const randomY = startY + Math.floor(i / 5) * 100 + Phaser.Math.Between(-30, 30);

      const obj = this.add.image(randomX, randomY, 'purpleBox');
      obj.setInteractive({ draggable: true });
      obj.setData('id', i); // 存储ID用于追踪
      obj.setData('originalIndex', i);

      // 添加编号文字
      const text = this.add.text(randomX, randomY, (i + 1).toString(), {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }).setOrigin(0.5);

      obj.setData('text', text);
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 文字跟随
      const text = gameObject.getData('text');
      text.x = dragX;
      text.y = dragY;

      // 拖拽时高亮
      gameObject.setTint(0xffffff);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      // 拖拽开始时置于顶层
      this.children.bringToTop(gameObject);
      const text = gameObject.getData('text');
      this.children.bringToTop(text);
      
      this.dragCount++;
    });

    this.input.on('dragend', (pointer, gameObject) => {
      // 取消高亮
      gameObject.clearTint();
      
      // 执行自动排序
      this.autoSort();
    });

    // 初始化排序顺序
    this.updateSortOrder();
  }

  autoSort() {
    // 收集所有物体及其Y坐标
    const sortData = this.objects.map(obj => ({
      obj: obj,
      y: obj.y,
      text: obj.getData('text')
    }));

    // 按Y坐标排序
    sortData.sort((a, b) => a.y - b.y);

    // 计算新的排列位置（垂直等间距排列）
    const startX = 400;
    const startY = 120;
    const verticalSpacing = 35;

    // 使用Tween动画移动到新位置
    sortData.forEach((item, index) => {
      const newY = startY + index * verticalSpacing;

      this.tweens.add({
        targets: item.obj,
        x: startX,
        y: newY,
        duration: 400,
        ease: 'Cubic.easeOut'
      });

      this.tweens.add({
        targets: item.text,
        x: startX,
        y: newY,
        duration: 400,
        ease: 'Cubic.easeOut'
      });
    });

    // 更新排序状态
    this.time.delayedCall(450, () => {
      this.updateSortOrder();
    });
  }

  updateSortOrder() {
    // 按当前Y坐标更新排序顺序
    const sorted = [...this.objects].sort((a, b) => a.y - b.y);
    this.sortOrder = sorted.map(obj => obj.getData('id') + 1);
    
    // 更新状态显示
    this.statusText.setText(
      `拖拽次数: ${this.dragCount} | 当前顺序: [${this.sortOrder.join(', ')}]`
    );
  }

  update(time, delta) {
    // 每帧检查是否需要更新状态（可选）
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2c3e50',
  scene: DragSortScene,
  parent: 'game-container'
};

const game = new Phaser.Game(config);

// 状态验证输出
console.log('Game initialized with drag-sort functionality');
console.log('Status signals: sortOrder (array), dragCount (number)');