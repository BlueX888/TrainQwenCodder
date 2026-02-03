class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证状态：排序次数
    this.objects = [];
    this.targetPositions = [200, 300, 400]; // 排序后的Y坐标位置
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建标题文字
    this.add.text(400, 50, 'Drag Purple Objects to Sort', {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // 创建排序次数显示
    this.sortText = this.add.text(400, 100, 'Sort Count: 0', {
      fontSize: '20px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建说明文字
    this.add.text(400, 550, 'Drag objects and release - they will auto-sort by Y position', {
      fontSize: '16px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    // 使用Graphics创建紫色矩形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x9932cc, 1); // 紫色
    graphics.fillRoundedRect(0, 0, 120, 80, 10);
    graphics.generateTexture('purpleBox', 120, 80);
    graphics.destroy();

    // 创建3个紫色物体
    const startX = 400;
    const startYPositions = [400, 250, 350]; // 初始Y坐标（打乱的）

    for (let i = 0; i < 3; i++) {
      const obj = this.add.image(startX, startYPositions[i], 'purpleBox');
      obj.setInteractive({ draggable: true });
      obj.setData('index', i); // 存储索引
      obj.setData('isDragging', false);
      
      // 添加文字标签
      const label = this.add.text(startX, startYPositions[i], `Object ${i + 1}`, {
        fontSize: '18px',
        color: '#ffffff'
      }).setOrigin(0.5);
      
      obj.setData('label', label);
      this.objects.push(obj);
    }

    // 设置拖拽事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.setData('isDragging', true);
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 更新标签位置
      const label = gameObject.getData('label');
      label.x = dragX;
      label.y = dragY;
      
      // 拖拽时高亮显示
      gameObject.setTint(0xdd66ff);
    });

    this.input.on('dragstart', (pointer, gameObject) => {
      gameObject.setData('isDragging', true);
      // 将拖拽物体置于顶层
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.getData('label'));
    });

    this.input.on('dragend', (pointer, gameObject) => {
      gameObject.setData('isDragging', false);
      gameObject.clearTint();
      
      // 松手后执行排序
      this.sortObjects();
    });
  }

  sortObjects() {
    // 收集所有物体及其当前Y坐标
    const objectsData = this.objects.map(obj => ({
      obj: obj,
      y: obj.y,
      label: obj.getData('label')
    }));

    // 按Y坐标从小到大排序
    objectsData.sort((a, b) => a.y - b.y);

    // 将物体移动到目标位置
    objectsData.forEach((data, index) => {
      const targetY = this.targetPositions[index];
      const targetX = 400;

      // 使用Tween动画平滑移动
      this.tweens.add({
        targets: data.obj,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Power2'
      });

      // 同时移动标签
      this.tweens.add({
        targets: data.label,
        x: targetX,
        y: targetY,
        duration: 400,
        ease: 'Power2'
      });
    });

    // 更新排序次数
    this.sortCount++;
    this.sortText.setText(`Sort Count: ${this.sortCount}`);

    // 在控制台输出排序结果（用于验证）
    console.log('Sorted! Count:', this.sortCount);
    console.log('Final order (top to bottom):', 
      objectsData.map(d => `Object ${d.obj.getData('index') + 1}`).join(', '));
  }

  update(time, delta) {
    // 可选：添加悬停效果
    this.objects.forEach(obj => {
      if (!obj.getData('isDragging')) {
        const pointer = this.input.activePointer;
        const bounds = obj.getBounds();
        
        if (Phaser.Geom.Rectangle.Contains(bounds, pointer.x, pointer.y)) {
          obj.setScale(1.05);
        } else {
          obj.setScale(1.0);
        }
      }
    });
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene
};

new Phaser.Game(config);