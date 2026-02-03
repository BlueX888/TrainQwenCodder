class DragSortScene extends Phaser.Scene {
  constructor() {
    super('DragSortScene');
    this.sortCount = 0; // 可验证的状态信号：排序次数
    this.objects = [];
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;

    // 创建背景提示文字
    this.add.text(width / 2, 30, 'Drag objects and release to auto-sort by Y position', {
      fontSize: '18px',
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);

    // 显示排序次数
    this.sortCountText = this.add.text(width / 2, 60, `Sort Count: ${this.sortCount}`, {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);

    // 创建10个白色矩形物体
    for (let i = 0; i < 10; i++) {
      // 随机位置
      const x = Phaser.Math.Between(100, width - 100);
      const y = Phaser.Math.Between(120, height - 80);
      
      // 创建白色矩形
      const rect = this.add.rectangle(x, y, 80, 50, 0xffffff);
      rect.setStrokeStyle(2, 0x000000);
      
      // 添加序号文本
      const text = this.add.text(x, y, `#${i + 1}`, {
        fontSize: '20px',
        color: '#000000',
        fontStyle: 'bold'
      }).setOrigin(0.5);
      
      // 将文本设置为矩形的子对象（方便一起移动）
      rect.text = text;
      rect.originalIndex = i + 1;
      
      // 设置为可交互
      rect.setInteractive({ draggable: true, useHandCursor: true });
      
      this.objects.push(rect);
    }

    // 拖拽开始事件
    this.input.on('dragstart', (pointer, gameObject) => {
      // 提升层级
      this.children.bringToTop(gameObject);
      this.children.bringToTop(gameObject.text);
      
      // 添加视觉反馈
      gameObject.setAlpha(0.7);
      gameObject.setScale(1.1);
    });

    // 拖拽中事件
    this.input.on('drag', (pointer, gameObject, dragX, dragY) => {
      gameObject.x = dragX;
      gameObject.y = dragY;
      
      // 文本跟随移动
      gameObject.text.x = dragX;
      gameObject.text.y = dragY;
    });

    // 拖拽结束事件
    this.input.on('dragend', (pointer, gameObject) => {
      // 恢复视觉效果
      gameObject.setAlpha(1);
      gameObject.setScale(1);
      
      // 触发自动排序
      this.autoSort();
    });
  }

  autoSort() {
    // 增加排序计数
    this.sortCount++;
    this.sortCountText.setText(`Sort Count: ${this.sortCount}`);

    // 收集所有物体及其Y坐标
    const sortData = this.objects.map(obj => ({
      object: obj,
      y: obj.y
    }));

    // 按Y坐标排序
    sortData.sort((a, b) => a.y - b.y);

    // 计算排列位置
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const startY = 150;
    const spacing = 50;

    // 使用缓动动画将物体移动到排序后的位置
    sortData.forEach((data, index) => {
      const targetY = startY + index * spacing;
      
      // 物体移动动画
      this.tweens.add({
        targets: data.object,
        x: centerX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });

      // 文本移动动画
      this.tweens.add({
        targets: data.object.text,
        x: centerX,
        y: targetY,
        duration: 500,
        ease: 'Power2'
      });
    });

    // 输出排序结果到控制台（用于验证）
    console.log('Sorted order (by Y):', sortData.map(d => `#${d.object.originalIndex}`).join(', '));
  }

  update(time, delta) {
    // 本示例不需要每帧更新逻辑
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: DragSortScene,
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);